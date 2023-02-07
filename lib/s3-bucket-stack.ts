// import * as cdk from 'aws-cdk-lib';
// import * as s3 from 'aws-cdk-lib/aws-s3';
// import * as sns from 'aws-cdk-lib/aws-sns';




// export class S3BucketStack extends cdk.Stack {
//     public readonly bucket; s3.bucket
    
//   constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
//     super(scope, id, props);


//     // Create the alert S3 bucket
//     const myBucket = new s3.Bucket(this, 's3-DataBucket', {
//       bucketName: 'Alert-data',
//       versioned: false,
//       publicReadAccess: false,
//       blockPublicAccess:  s3.BlockPublicAccess.BLOCK_ALL,
//       removalPolicy: cdk.RemovalPolicy.DESTROY,
//     });




//     // Create the SNS topic
//     const topic = new sns.Topic(this, 'MyTopic');

//     // Add event notification on bucket object change
//     myBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.SnsDestination(topic));





//   }
// }
