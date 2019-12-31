import * as postcss from 'postcss';
import * as _ from 'lodash';
import {
  defaults,
  prepareFilterBy,
  prepareGroupBy,
  extractImages,
  applyFilterBy,
  applyGroupBy,
  setTokens,
  runSpritesmith,
  saveSpritesheets,
  mapSpritesheetProps,
  updateReferences,
  createLogger
} from './kernal';

/**
 * Plugin registration.
 */
export default postcss.plugin('postcss-sprites', (options = {}) => {
  return (css: any) => {
    if (css.nodes.length) {
      if (css.nodes[0].type !== 'comment') {
        return;
      } else {
        if (css.nodes[0].text !== 'sprite') {
          return;
        }
      }
    }

    // Extend defaults
    const opts: any = _.merge({}, defaults, options);

    // Setup the logger
    opts.logger = createLogger(opts.verbose);

    // Prepare filter & group functions
    prepareFilterBy(opts);
    prepareGroupBy(opts);

    // Process it
    return extractImages(css, opts)
      .spread((opts: any, images: any) => applyFilterBy(opts, images))

      .spread((opts: any, images: any) => applyGroupBy(opts, images))

      .spread((opts: any, images: any) => setTokens(css, opts, images))

      .spread((root: any, opts: any, images: any) => runSpritesmith(opts, images))

      .spread((opts: any, images: any, spritesheets: any) =>
        saveSpritesheets(opts, images, spritesheets)
      )

      .spread((opts: any, images: any, spritesheets: any) =>
        mapSpritesheetProps(opts, images, spritesheets)
      )

      .spread((opts: any, images: any, spritesheets: any) =>
        updateReferences(css, opts, images, spritesheets)
      )

      .spread((root: any, opts: any, images: any, spritesheets: any) => {
        opts.logger(
          `${spritesheets.length} ${
            spritesheets.length > 1 ? 'spritesheets' : 'spritesheet'
          } generated.`
        );
      })
      .catch((err: any) => {
        throw err;
      });
  };
});
