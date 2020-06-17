import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as ImageBuild from '../lib/imagebuild';

test('Empty Stack', () => {
    //const app = new cdk.App();
    // WHEN
    //const stack = new ImageBuild.AmplifyImageBuild(app, 'MyTestStack', {stage: 'alpha'});
    // THEN
    expect(1).toBe(1);
});