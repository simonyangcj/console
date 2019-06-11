import * as _ from 'lodash-es';
import * as React from 'react';

import { BuildConfigModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { gettext } from '../utils/gettext';

const samples = [
  {
    header: gettext('Build from Dockerfile'),
    details: gettext('A Dockerfile build performs an image build using a Dockerfile in the source repository or specified in build configuration.'),
    templateName: 'docker-build',
    kind: referenceForModel(BuildConfigModel),
  },
  {
    header: gettext('Source-to-Image (S2I) build'),
    details: gettext('S2I is a tool for building reproducible container images. It produces ready-to-run images by injecting the application source into a container image and assembling a new image.'),
    templateName: 's2i-build',
    kind: referenceForModel(BuildConfigModel),
  },
  {
    header: gettext('Pipeline build'),
    details: gettext('The Pipeline build strategy allows developers to define a Jenkins pipeline for execution by the Jenkins pipeline plugin. The build can be started, monitored, and managed in the same way as any other build type.'),
    templateName: 'pipeline-build',
    kind: referenceForModel(BuildConfigModel),
  }
];

export const BuildConfigSidebar = ({loadSampleYaml, downloadSampleYaml}) => {
  return <ol className="co-resource-sidebar-list">
    {_.map(samples, (sample) => <SampleYaml
      key={sample.templateName}
      sample={sample}
      loadSampleYaml={loadSampleYaml}
      downloadSampleYaml={downloadSampleYaml} />)}
  </ol>;
};
