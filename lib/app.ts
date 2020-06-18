import 'source-map-support/register';
import { AmplifyImageBuild } from './imagebuild';
import codebuild = require('@aws-cdk/aws-codebuild');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import cdk = require('@aws-cdk/core');
import cicd = require('@aws-cdk/app-delivery');
 
const app = new cdk.App();
 
// We define a stack that contains the CodePipeline
const pipelineStack = new cdk.Stack(app, 'AmplifyImageBuildPipelineStack');
const pipeline = new codepipeline.Pipeline(pipelineStack, 'CodePipeline', {
  // Mutating a CodePipeline can cause the currently propagating state to be
  // "lost". Ensure we re-run the latest change through the pipeline after it's
  // been mutated so we're sure the latest state is fully deployed through.
  restartExecutionOnUpdate: true,
  /* ... */
});

// Configure the CodePipeline source - where your CDK App's source code is hosted
const sourceOutput = new codepipeline.Artifact();
const source = new codepipeline_actions.GitHubSourceAction({
    actionName: 'GitHub_Source',
    owner: 'flochaz',
    repo: 'amplify-console',
    oauthToken: cdk.SecretValue.secretsManager('github-token'),
    output: sourceOutput,
    branch: 'master', // default: 'master'
    trigger: codepipeline_actions.GitHubTrigger.POLL // default: 'WEBHOOK', 'NONE' is also possible for no Source trigger
  });

pipeline.addStage({
  stageName: 'source',
  actions: [source],
});
 
const project = new codebuild.PipelineProject(pipelineStack, 'CodeBuild', {
  environment: {
    buildImage: codebuild.LinuxBuildImage.STANDARD_4_0
  }
});
const synthesizedApp = new codepipeline.Artifact();
const buildAction = new codepipeline_actions.CodeBuildAction({
  actionName: 'CodeBuild',
  project,
  input: sourceOutput,
  outputs: [synthesizedApp],
});
pipeline.addStage({
  stageName: 'build',
  actions: [buildAction],
});
 
// Optionally, self-update the pipeline stack
const selfUpdateStage = pipeline.addStage({ stageName: 'SelfUpdate' });
selfUpdateStage.addAction(new cicd.PipelineDeployStackAction({
  stack: pipelineStack,
  input: synthesizedApp,
  adminPermissions: true,
}));
 
// Now add our service stacks
const deployStage = pipeline.addStage({ stageName: 'Deploy' });
const imageBuildStack = new AmplifyImageBuild(app, 'AmplifyImageBuild', {});
// Add actions to deploy the stacks in the deploy stage:
const deployImageBuildServiceAction = new cicd.PipelineDeployStackAction({
  stack: imageBuildStack,
  input: synthesizedApp,
  // See the note below for details about this option.
  adminPermissions: true, 
});
deployStage.addAction(deployImageBuildServiceAction);