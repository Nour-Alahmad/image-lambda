"use strict";

const AWS = require("aws-sdk");

const s3 = new AWS.S3();

exports.handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  try {
    const imagesJson = await s3
      .getObject({
        Bucket: bucket,
        Key: "images.json",
      })
      .promise();

    const images = imagesJson.Body ? JSON.parse(imagesJson.Body.toString()) : [];

    const imageMetadata = {
      name: key,
      size: event.Records[0].s3.object.size,
      type: event.Records[0].s3.object.contentType,
    };

    const index = images.findIndex((image) => image.name === imageMetadata.name);
    if (index === -1) {
      images.push(imageMetadata);
    } else {
      images[index] = imageMetadata;
    }

    await s3
      .putObject({
        Bucket: bucket,
        Key: "images.json",
        Body: JSON.stringify(images),
        ContentType: "application/json",
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify("Image processed successfully."),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify("An error occurred while processing the image."),
    };
  }
};
