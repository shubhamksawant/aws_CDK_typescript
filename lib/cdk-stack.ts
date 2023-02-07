import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { HitCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';


import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';

import * as emrs from 'aws-cdk-lib/aws-emrserverless';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as custom from 'aws-cdk-lib/custom-resources';




export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


//     const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
//       downstream: hello
//     });


// // defines an API Gateway REST API resource backed by our "hello" function.
//     new apigw.LambdaRestApi(this, 'Endpoint', {
//        handler: helloWithCounter.handler
//     });

//     new TableViewer(this, 'ViewHitCounter', {
//       title: 'Hello Hits',
//       table: helloWithCounter.table
//     });


    //    // defines an AWS Lambda resource
    // const function_name = 'hellohandler';
    // const lambda_path = 'lambda';
  
    // const handler = new lambda.Function(this, 'function_name', {
    //   functionName: function_name,  
    //   runtime: lambda.Runtime.PYTHON_3_7,    // execution environment
    //   code: lambda.Code.fromAsset(lambda_path),  // code loaded from "lambda" directory
    //   handler: 'hello.hellohandler'                // file is "hello", function is "handler"
    // });


     // Create a serverless Spark app
     const serverlessApp = new emrs.CfnApplication(this, 'emr-spark_app', {
        releaseLabel: 'emr-6.9.0',
        type: 'SPARK',
        name: 'fusion-spark',
    });


    // We need an execution role to run the job, this one has no access to anything
    // But will be granted PassRole access by the Lambda that's starting the job.
    const role = new iam.Role(this, 'spark_job_execution_role', {
      assumedBy: new iam.ServicePrincipal('emr-serverless.amazonaws.com'),
    });


    // Create a custom resource that starts a job run
    const myJobRun = new custom.AwsCustomResource(this, 'serverless-job-run', {
      onCreate: {
        service: 'EMRServerless',
        action: 'startJobRun',
        parameters: {
          applicationId: serverlessApp.ref,
          executionRoleArn: role.roleArn,
          name: 'cdkJob',
          jobDriver: { sparkSubmit: { entryPoint: 'local:///usr/lib/spark/examples/src/main/python/pi.py' } },
        },
        physicalResourceId: custom.PhysicalResourceId.fromResponse('jobRunId'),
      },
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: custom.AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });


    
    // Ensure the Lambda can call startJobRun with the earlier-created role
    // myJobRun.grantPrincipal.addToPolicy(new iam.PolicyStatement({
    myJobRun.grantPrincipal.addToPrincipalPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [role.roleArn],
      actions: ['iam:PassRole'],
      conditions: {
        StringLike: {
          'iam:PassedToService': 'emr-serverless.amazonaws.com',
        },
      },
    }));



    // Create the alert S3 bucket
    const myBucket = new s3.Bucket(this, 's3-data-bucket', {
      bucketName: 'fusion-alert-data',
      versioned: false,
      publicReadAccess: false,
      blockPublicAccess:  s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // defines an AWS Lambda resource
    const function_name = 'lambda_handler';
    const lambda_path = 'lambda';
  
    const handler = new lambda.Function(this, 'function_name', {
      functionName: function_name,  
      runtime: lambda.Runtime.PYTHON_3_7,    // execution environment
      code: lambda.Code.fromAsset(lambda_path),  // code loaded from "lambda" directory
      handler: 'basic_lambda_function.lambda_handler'                // file is "hello", function is "handler"
    });

    // myBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(handler));


    // Create the SNS topic
    const topic = new sns.Topic(this, 'fusion-s3-alert-data');
    topic.addSubscription(new subs.LambdaSubscription(handler));

    // const eventSource = new lambdaEventSources.SnsEventSource(topic);
    // handler.addEventSource(eventSource);

    

  }
}
