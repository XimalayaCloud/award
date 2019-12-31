import * as Promise from 'bluebird';
import * as _ from 'lodash';

const Spritesmith = require('spritesmith');

/**
 * Generate the spritesheet.
 * @param  {Object} opts
 * @param  {Array}  images
 * @return {Promise}
 */
export default function run(opts: any, images: any) {
  const config = _.defaultsDeep(
    {},
    {
      src: _.map(images, 'path')
    },
    opts.spritesmith
  );

  // Increase padding to handle retina ratio
  if (areRetinaImages(images)) {
    const ratio = (_ as any)
      .chain(images)
      .flatten('ratio')
      .uniq()
      .head()
      .value().ratio;

    if (ratio) {
      config.padding = config.padding * ratio;
    }
  }

  return (Promise as any)
    .promisify(Spritesmith.run, { context: Spritesmith })(config)
    .then((spritesheet: any) => {
      spritesheet.extension = 'png';

      return spritesheet;
    });
}

/**
 * Checkes whether all images are retina.
 * @param  {Array} images
 * @return {Boolean}
 */
function areRetinaImages(images: any): boolean {
  return _.every(images, (image: any) => image.retina);
}
