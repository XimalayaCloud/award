/* eslint-disable no-param-reassign */
import * as path from 'path';
import * as fs from 'fs-extra';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as debug from 'debug';
import { memoryFile } from '../../../help';
import RasterFactory from './factories/raster';
import { dev } from '../../utils';
import { watchImagesPath } from '../../utils/constant';

/**
 * Wrap with promises.
 */
Promise.promisifyAll(fs);

/**
 * Plugin constants.
 */
const RELATIVE_TO_RULE = 'rule';
const BACKGROUND = 'background';
const BACKGROUND_IMAGE = 'background-image';
const ONE_SPACE = ' ';
const COMMENT_TOKEN_PREFIX = '@replace|';
const GROUP_DELIMITER = '.';
const GROUP_MASK = '*';
const TYPE_RASTER = 'raster';
const TYPE_VECTOR = 'vector';

/**
 * Plugin defaults.
 */
export const defaults = {
  basePath: './',
  stylesheetPath: null,
  spritePath: './',
  relativeTo: 'file',
  filterBy: [],
  groupBy: [],
  retina: false,
  hooks: {
    onSaveSpritesheet: null,
    onUpdateRule: null
  },
  spritesmith: {
    engine: 'pixelsmith',
    algorithm: 'binary-tree',
    padding: 0,
    engineOpts: {},
    exportOpts: {}
  },
  svgsprite: {
    mode: {
      css: {
        dimensions: true,
        bust: false,
        render: {
          css: true
        }
      }
    },

    shape: {
      id: {
        generator(name: any, file: any) {
          // eslint-disable-next-line no-buffer-constructor
          return new Buffer(file.path).toString('base64');
        }
      }
    },

    svg: {
      precision: 5
    }
  },
  verbose: false
};

/**
 * Prepares the filter functions.
 * @param  {Object} opts
 * @param  {Result} result
 * @return
 */
export function prepareFilterBy(opts: any) {
  if (_.isFunction(opts.filterBy)) {
    opts.filterBy = [opts.filterBy];
  }

  // Filter non existing images
  opts.filterBy.unshift((image: any) => {
    return (fs as any).statAsync(image.path).catch(() => {
      const message = `Skip ${image.url} because doesn't exist.`;

      opts.logger(message);

      throw new Error(message);
    });
  });
}

/**
 * Prepares the group functions.
 * @param  {Object} opts
 * @return
 */
export function prepareGroupBy(opts: any) {
  if (_.isFunction(opts.groupBy)) {
    opts.groupBy = [opts.groupBy];
  }

  // Group by retina ratio
  if (opts.retina) {
    opts.groupBy.unshift((image: any) => {
      if (image.retina) {
        return Promise.resolve(`@${image.ratio}x`);
      }

      return Promise.reject(new Error('Not a retina image.'));
    });
  }

  // Group by type - 'vector' or 'raster'
  opts.groupBy.unshift((image: any) => {
    if (/^\.svg/.test(path.extname(image.path))) {
      return Promise.resolve(TYPE_VECTOR);
    }

    return Promise.resolve(TYPE_RASTER);
  });
}

/**
 * Walks the given CSS string and extracts all images
 * that can be converted to sprite.
 * @param  {Node}   root
 * @param  {Object} opts
 * @param  {Result} result
 * @return {Promise}
 */
export function extractImages(root: any, opts: any): any {
  let images: any = [];

  opts.logger('Extracting the images...');

  // Search for background & background image declartions
  root.walkRules((rule: any) => {
    const styleFilePath =
      opts.relativeTo === RELATIVE_TO_RULE ? rule.source.input.file : root.source.input.file;
    const ABSOLUTE_URL = /^\//;

    // The host object of found image
    const image = {
      path: null,
      url: null,
      originalUrl: null,
      retina: false,
      ratio: 1,
      groups: [],
      token: '',
      styleFilePath
    };

    // Manipulate only rules with image in them
    if (hasImageInRule(rule.toString())) {
      const imageUrl = getImageUrl(rule.toString());

      (image as any).originalUrl = imageUrl[0];
      (image as any).url = imageUrl[1];

      if (isImageSupported(image.url)) {
        // Search for retina images
        if (opts.retina && isRetinaImage(image.url)) {
          image.retina = true;
          image.ratio = getRetinaRatio(image.url);
        }

        // Get the filesystem path to the image
        if (ABSOLUTE_URL.test((image as any).url)) {
          (image as any).path = path.resolve(opts.basePath + image.url);
        } else {
          (image as any).path = path.resolve(path.dirname(styleFilePath), (image as any).url);
        }

        images.push(image);
      } else {
        opts.logger(`Skip ${image.url} because isn't supported.`);
      }
    }
  });

  // Remove duplicates and empty values
  images = _.uniqBy(images, 'path');

  return Promise.resolve([opts, images]);
}

/**
 * Apply filterBy functions over collection of exported images.
 * @param  {Object}  opts
 * @param  {Array}   images
 * @return {Promise}
 */
export function applyFilterBy(opts: any, images: any) {
  opts.logger('Applying the filters...');

  return Promise.reduce(
    opts.filterBy,
    (images: any, filterFn: any) => {
      return Promise.filter(
        images,
        (image: any) => {
          return filterFn(image)
            .then(() => true)
            .catch(() => false);
        },
        { concurrency: 1 }
      );
    },
    images
  ).then((images: any) => [opts, images]);
}

/**
 * Apply groupBy functions over collection of exported images.
 * @param  {Object} opts
 * @param  {Array}  images
 * @return {Promise}
 */
export function applyGroupBy(opts: any, images: any) {
  opts.logger('Applying the groups...');

  return Promise.reduce(
    opts.groupBy,

    (images: any, groupFn: any) => {
      return Promise.map(images, (image: any) => {
        return groupFn(image)
          .then((group: any) => {
            image.groups.push(group);
            return image;
          })
          .catch(() => image);
      });
    },
    images
  ).then((images: any) => [opts, images]);
}

/**
 * Replaces the background declarations that needs to be updated
 * with a sprite image.
 * @param  {Node}   root
 * @param  {Object} opts
 * @param  {Array}  images
 * @return {Promise}
 */
export function setTokens(root: any, opts: any, images: any) {
  return new Promise((resolve: any) => {
    root.walkDecls(/^background(-image)?$/, (decl: any) => {
      const rule = decl.parent;
      const ruleStr = rule.toString();
      let url;
      let image;
      let color;
      let commentDecl;

      if (!hasImageInRule(ruleStr)) {
        return;
      }

      // Manipulate only rules with image in them

      url = getImageUrl(ruleStr)[1];
      image = _.find(images, { url });

      if (!image) {
        return;
      }

      // Remove all necessary background declarations

      rule.walkDecls(/^background-(repeat|size|position)$/, (decl: any) => decl.remove());

      // Extract color to background-color property
      if (decl.prop === BACKGROUND) {
        color = getColor(decl.value);

        if (color) {
          decl.cloneAfter({
            prop: 'background-color',
            value: color
          }).raws.before = ONE_SPACE;
        }
      }

      // Replace with comment token
      if (_.includes([BACKGROUND, BACKGROUND_IMAGE], decl.prop)) {
        commentDecl = decl.cloneAfter({
          type: 'comment',
          text: image.url
        });

        commentDecl.raws.left = `${ONE_SPACE}${COMMENT_TOKEN_PREFIX}`;
        (image as any).token = commentDecl.toString();

        decl.remove();
      }
    });

    resolve([root, opts, images]);
  });
}

/**
 * Process the images through spritesmith module.
 * @param  {Object} opts
 * @param  {Array}  images
 * @return {Promise}
 */
export function runSpritesmith(opts: any, images: any) {
  opts.logger('Generating the spritesheets...');

  return new Promise((resolve: any, reject: any) => {
    const promises: any = _.chain(images)
      .groupBy(image => {
        const tmp: any = image.groups.map(maskGroup(true));
        tmp.unshift('_');

        return tmp.join(GROUP_DELIMITER);
      })

      .map((images: any, tmp: any) => {
        if (dev()) {
          let map: any = {};
          if (memoryFile.existsSync(watchImagesPath)) {
            const filemap = memoryFile.readFileSync(watchImagesPath, 'utf-8');
            map = JSON.parse(filemap);
          }
          images.forEach((image: any) => {
            if (map[image.path]) {
              map[image.path].push(image.styleFilePath);
            } else {
              map[image.path] = [image.styleFilePath];
            }
          });
          memoryFile.writeFileSync(watchImagesPath, JSON.stringify(map));
        }

        return RasterFactory(opts, images).then((spritesheet: any) => {
          // Remove the '_', 'raster' or 'vector' prefixes
          tmp = tmp.split(GROUP_DELIMITER).splice(2);

          spritesheet.groups = tmp.map(maskGroup());

          return spritesheet;
        });
      })
      .value();

    Promise.all(promises)
      .then((spritesheets: any) => {
        resolve([opts, images, spritesheets]);
      })
      .catch((err: any) => {
        reject(err);
      });
  });
}

/**
 * Saves the spritesheets to the disk.
 * @param  {Object} opts
 * @param  {Array}  images
 * @param  {Array}  spritesheets
 * @return {Promise}
 */
export function saveSpritesheets(opts: any, images: any, spritesheets: any) {
  opts.logger('Saving the spritesheets...');

  return Promise.each(spritesheets, (spritesheet: any) => {
    return (_.isFunction(opts.hooks.onSaveSpritesheet)
      ? Promise.resolve(opts.hooks.onSaveSpritesheet(opts, spritesheet))
      : Promise.resolve(makeSpritesheetPath(opts, spritesheet))
    ).then((res: any) => {
      if (!res) {
        throw new Error('postcss-sprites: Spritesheet requires a relative path.');
      }

      if (_.isString(res)) {
        spritesheet.path = res;
      } else {
        _.assign(spritesheet, res);
      }

      spritesheet.path = spritesheet.path.replace(/\\/g, '/');

      return (fs as any).outputFileAsync(spritesheet.path, spritesheet.image);
    });
  }).then((spritesheets: any) => {
    return [opts, images, spritesheets];
  });
}

/**
 * Map spritesheet props to every image.
 * @param  {Object} opts
 * @param  {Array}  images
 * @param  {Array}  spritesheets
 * @return {Promise}
 */
export function mapSpritesheetProps(opts: any, images: any, spritesheets: any) {
  _.forEach(spritesheets, ({ coordinates, path, properties }: any) => {
    const spritePath = path;
    const spriteWidth = properties.width;
    const spriteHeight = properties.height;

    _.forEach(coordinates, (coords, imagePath) => {
      (_.chain(images).find(['path', imagePath]) as any)
        .merge({
          coords,
          spritePath,
          spriteWidth,
          spriteHeight
        })
        .value();
    });
  });

  return Promise.resolve([opts, images, spritesheets]);
}

/**
 * Updates the CSS references.
 * @param  {Node}   root
 * @param  {Object} opts
 * @param  {Array}  images
 * @param  {Array}  spritesheets
 * @return {Promise}
 */
export function updateReferences(root: any, opts: any, images: any, spritesheets: any) {
  opts.logger('Replacing the references...');

  root.walkComments((comment: any) => {
    let rule;
    let image: any;

    // Manipulate only comment tokens
    if (isToken(comment.toString())) {
      rule = comment.parent;
      image = _.find(images, { url: comment.text });

      // Update the rule with background declarations
      if (image) {
        // Generate CSS url to sprite
        (image as any).spriteUrl = path.relative(
          opts.stylesheetPath || path.dirname(root.source.input.file),
          image.spritePath
        );
        image.spriteUrl = image.spriteUrl.split(path.sep).join('/');

        // Update rule
        if (_.isFunction(opts.hooks.onUpdateRule)) {
          opts.hooks.onUpdateRule(rule, comment, image);
        } else {
          updateRule(rule, comment, image);
        }

        // Cleanup token
        comment.remove();
      }
    }
  });

  return Promise.resolve([root, opts, images, spritesheets]);
}

/**
 * Update an single CSS rule.
 * @param  {Node}   rule
 * @param  {Node}   token
 * @param  {Object} image
 * @return
 */
export function updateRule(rule: any, token: any, image: any) {
  const { ratio, coords, spriteUrl, spriteWidth, spriteHeight } = image;
  const posX = -1 * Math.abs(coords.x / ratio);
  const posY = -1 * Math.abs(coords.y / ratio);
  const sizeX = spriteWidth / ratio;
  const sizeY = spriteHeight / ratio;

  token
    .cloneAfter({
      type: 'decl',
      prop: 'background-image',
      value: `url(${spriteUrl})`
    })
    .cloneAfter({
      prop: 'background-position',
      value: `${posX}px ${posY}px`
    })
    .cloneAfter({
      prop: 'background-size',
      value: `${sizeX}px ${sizeY}px`
    });
}

/// //////////////////////
// ----- Helpers ----- //
/// //////////////////////

/**
 * Checks for image url in the given CSS rules.
 * @param  {String}  rule
 * @return {Boolean}
 */
export function hasImageInRule(rule: any) {
  return /background[^:]*.*url[^;]+/gi.test(rule);
}

/**
 * Extracts the url of image from the given rule.
 * @param  {String} rule
 * @return {Array}
 */
export function getImageUrl(rule: any) {
  const matches = /url(?:\(['"]?)(.*?)(?:['"]?\))/gi.exec(rule);
  let original = '';
  let normalized = '';

  if (matches) {
    original = matches[1];
    normalized = original
      .replace(/['"]/gi, '') // replace all quotes
      .replace(/\?.*$/gi, ''); // replace query params
  }

  return [original, normalized];
}

/**
 * Checks whether the image is supported.
 * @param  {String}  url
 * @return {Boolean}
 */
export function isImageSupported(url: any) {
  const http = /^http[s]?/gi;
  const base64 = /^data\:image/gi;
  const svg = /\.svg$/gi;

  return !http.test(url) && !base64.test(url) && !svg.test(url);
}

/**
 * Checks whether the image is retina.
 * @param  {String}  url
 * @return {Boolean}
 */
export function isRetinaImage(url: any) {
  return /@(\d)x\.[a-z]{3,4}$/gi.test(url);
}

/**
 * Extracts the retina ratio of image.
 * @param  {String} url
 * @return {Number}
 */
export function getRetinaRatio(url: any) {
  const matches = /@(\d)x\.[a-z]{3,4}$/gi.exec(url);

  if (!matches) {
    return 1;
  }

  return parseInt(matches[1], 10);
}

/**
 * Extracts the color from background declaration.
 * @param  {String}  declValue
 * @return {String?}
 */
export function getColor(declValue: any) {
  const regexes = ['(#([0-9a-f]{3}){1,2})', 'rgba?\\([^\\)]+\\)'];
  let match = null;

  _.forEach(regexes, (regex: any) => {
    regex = new RegExp(regex, 'gi');

    if (regex.test(declValue)) {
      match = declValue.match(regex)[0];
    }
  });

  return match;
}

/**
 * Simple helper to avoid collisions with group names.
 * @param  {Boolean} toggle
 * @return {Function}
 */
export function maskGroup(toggle = false) {
  const input = new RegExp(`[${toggle ? GROUP_DELIMITER : GROUP_MASK}]`, 'gi');
  const output = toggle ? GROUP_MASK : GROUP_DELIMITER;

  return (value: any) => value.replace(input, output);
}

/**
 * Generate the filepath to the sprite.
 * @param  {Object}  opts
 * @param  {Object}  spritesheet
 * @return {String}
 */
export function makeSpritesheetPath(opts: any, { groups, extension }: any) {
  return path.join(opts.spritePath, ['sprite', ...groups, extension].join('.'));
}

/**
 * Check whether the comment is token that
 * should be replaced with background declarations.
 * @param  {String}  commentValue
 * @return {Boolean}
 */
export function isToken(commentValue: any) {
  return commentValue.indexOf(COMMENT_TOKEN_PREFIX) > -1;
}

/**
 * Create a logger that can be disabled in runtime.
 *
 * @param  {Boolean} enabled
 * @return {Function}
 */
export function createLogger(enabled: any) {
  if (enabled) {
    debug.enable('postcss-sprites');
  }

  return debug('postcss-sprites');
}
