import { logging } from '@angular-devkit/core';

import { Schema } from '../deploy/schema';

export async function run(
  dir: string,
  options: Schema,
  logger: logging.LoggerApi
) {
  try {
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);

    const bucketPath: string = options.subFolder ? `/${options.subFolder}` : '';
    const { stdout } = await exec(
      `aws s3 sync --acl public-read --delete ${dir} s3://${options.bucket}${bucketPath} --region ${options.region}`
    );

    logger.info(`Successfully deployed application.`);
    logger.info(stdout);
  } catch (e) {
    logger.error(`Failed to deploy application.`);
    logger.error(e.message);
  }
}
