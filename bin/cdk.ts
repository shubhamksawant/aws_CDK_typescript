#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';
// import { S3BucketStack }  from  '../lib/s3-bucket-stack';



const app = new cdk.App();
new CdkStack(app, 'CdkStack');




// // creating s3 buckket stack 

// const s3_bucket_stack = new S3BucketStack{app, 's3-DataBucket');
