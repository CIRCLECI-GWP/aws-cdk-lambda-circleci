import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsCdkLambdaCircleciStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const circleCiGwpBucket = new s3.Bucket(this, "circle-ci-gwp-bucket", {
      bucketName: "circle-ci-gwp-project-app-unique",
    });

    const circleCiGwpTable = new dynamodb.Table(this, "CircleCIGwpTable", {
      tableName: "CircleCIGwpTable",
      partitionKey: { name: "jobId", type: dynamodb.AttributeType.STRING },
    });

    const circleCiGwpLambda = new lambda.Function(this, "CircleCiGwpLambda", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      timeout: cdk.Duration.seconds(30),
      code: lambda.Code.fromAsset("lambda/"),
      environment: {
        TABLE_NAME: circleCiGwpTable.tableName,
        BUCKET_NAME: circleCiGwpBucket.bucketName,
      },
    });

    circleCiGwpBucket.grantPut(circleCiGwpLambda);
    circleCiGwpTable.grantReadWriteData(circleCiGwpLambda);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'AwsCdkLambdaCircleciQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
