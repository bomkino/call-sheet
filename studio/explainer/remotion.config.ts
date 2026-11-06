/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
// Frames pass through JPEG on their way to the encoder; the default quality
// (80) leaves blocking on fine type and gradients.
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
