import cdk = require('@aws-cdk/core');
import codebuild = require('@aws-cdk/aws-codebuild');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import ecr = require('@aws-cdk/aws-ecr');

/** This stack handles the building and publishing of Amplify images. */
// If you want to add parameters for your CDK Stack, you can toss them in here
export interface ImageBuildProps {
  readonly stackName?: string;
  /**
   * Stack tags that will be applied to all the taggable resources and the stack itself.
   *
   * @default {}
   */
  readonly tags?: {
    [key: string]: string;
  };
}

export class AmplifyImageBuild extends cdk.Stack {

  constructor(scope: cdk.App, name: string, props: ImageBuildProps) {
    super(scope, name, {
      ...props
    });


    const amplifyImageEcr = new ecr.Repository(this, 'Amplify-build-images', {
      repositoryName: 'amplify-build-images',
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const supportedVersions = ["latest",  "amazonlinux1", "custom"];

    supportedVersions.forEach(supportedVersion => {
      const AmplifyVersion = supportedVersion;
      const nameFriendlyVersion = AmplifyVersion.replace(/\./g, '_');

      const sourceOutput = new codepipeline.Artifact();
      const sourceAction = new codepipeline_actions.GitHubSourceAction({
        actionName: 'GitHub_Source',
        owner: 'flochaz',
        repo: 'amplify-console',
        oauthToken: cdk.SecretValue.secretsManager('github-token'),
        output: sourceOutput,
        branch: 'master', // default: 'master'
        trigger: codepipeline_actions.GitHubTrigger.POLL // default: 'WEBHOOK', 'NONE' is also possible for no Source trigger
      });

      // Define the build project with all env vars shared through the pipeline
      const amplifyImageProject = new codebuild.PipelineProject(this, `AmplifyImage-${nameFriendlyVersion}`, {
        projectName: `AmplifyImage-${nameFriendlyVersion}`,
        environment: {
          computeType: codebuild.ComputeType.SMALL,
          buildImage: codebuild.LinuxBuildImage.STANDARD_3_0,
          privileged: true
        },
        buildSpec: codebuild.BuildSpec.fromSourceFilename('images/buildspec.yml'),
        environmentVariables: {
          REPOSITORY_URI: { value: amplifyImageEcr.repositoryUri },
          AWS_DEFAULT_REGION: { value: this.region },
          AMPLIFY_IMAGE_VERSION: { value: AmplifyVersion }
        }
      });

      amplifyImageEcr.grantPullPush(amplifyImageProject);

      let amplifyImageBuildAction = new codepipeline_actions.CodeBuildAction({
        actionName: `docker-Amplify-${nameFriendlyVersion}`,
        project: amplifyImageProject,
        input: sourceOutput
      });

      new codepipeline.Pipeline(this, `PipelineAmplify-${nameFriendlyVersion}`, {
        pipelineName: `AmplifyImageBuild-${nameFriendlyVersion}`,
        stages: [
          {
            stageName: 'Source',
            actions: [sourceAction]
          },
          {
            stageName: 'AmplifyDockerImage',
            actions: [amplifyImageBuildAction]
          }
        ]
      })
    });
  }
}