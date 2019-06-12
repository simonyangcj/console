/* eslint-disable no-undef */
import * as React from 'react';
import * as _ from 'lodash-es';

// eslint-disable-next-line no-unused-vars
import { K8sResourceKindReference, referenceFor } from '../module/k8s';
import { cloneBuild, formatBuildDuration } from '../module/k8s/builds';
import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { errorModal } from './modals';
import { BuildHooks, BuildStrategy, Cog, SectionHeading, history, navFactory, ResourceCog, ResourceLink, resourceObjPath, ResourceSummary, Timestamp, gettext } from './utils';
import { BuildPipeline } from './build-pipeline';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { fromNow } from './utils/datetime';
import { EnvironmentPage } from './environment';
import { BuildLogs } from './build-logs';
import { ResourceEventStream } from './events';

const BuildsReference: K8sResourceKindReference = 'Build';

const { common, EditEnvironment } = Cog.factory;

const cloneBuildAction = (kind, build) => ({
  label: gettext('Rebuild'),
  callback: () => cloneBuild(build).then(clone => {
    history.push(resourceObjPath(clone, referenceFor(clone)));
  }).catch(err => {
    const error = err.message;
    errorModal({ error });
  }),
});

const menuActions = [
  cloneBuildAction,
  EditEnvironment,
  ...common,
];

export enum BuildStrategyType {
  Docker = 'Docker',
  Custom = 'Custom',
  JenkinsPipeline = 'JenkinsPipeline',
  Source = 'Source',
}

export const BuildsDetails: React.SFC<BuildsDetailsProps> = ({ obj: build }) => {
  const { logSnippet, message, startTimestamp } = build.status;
  const triggeredBy = _.map(build.spec.triggeredBy, 'message').join(', ');
  const duration = formatBuildDuration(build);
  const hasPipeline = build.spec.strategy.type === BuildStrategyType.JenkinsPipeline;
  const statusMap = {
    'New': gettext('New'),
    'Pending': gettext('Pending'),
    'Running': gettext('Running'),
    'Complete': gettext('Complete'),
    'Failed': gettext('Failed'),
    'Error': gettext('Error'),
    'Cancelled': gettext('Cancelled'),
  };
  const getStatusStr = status => {
    return statusMap[status] || status; 
  }

  return <React.Fragment>
    <div className="co-m-pane__body">
      <SectionHeading text={gettext('Build Overview')} />
      {hasPipeline && <div className="row">
        <div className="col-xs-12">
          <BuildPipeline obj={build} />
        </div>
      </div>}
      <div className="row">
        <div className="col-sm-6">
          <ResourceSummary resource={build} showPodSelector={false} showNodeSelector={false}>
            {triggeredBy && <dt>{gettext('Triggered By')}</dt>}
            {triggeredBy && <dd>{triggeredBy}</dd>}
            {startTimestamp && <dt>{gettext('Started')}</dt>}
            {startTimestamp && <dd><Timestamp timestamp={startTimestamp} /></dd>}
          </ResourceSummary>
        </div>
        <div className="col-sm-6">
          <BuildStrategy resource={build}>
            <dt>{gettext('Status')}</dt>
            <dd>{getStatusStr(build.status.phase)}</dd>
            {logSnippet && <dt>{gettext('Log Snippet')}</dt>}
            {logSnippet && <dd><pre>{logSnippet}</pre></dd>}
            {message && <dt>{gettext('Reason')}</dt>}
            {message && <dd>{message}</dd>}
            {duration && <dt>{gettext('Duration')}</dt>}
            {duration && <dd>{duration}</dd>}
          </BuildStrategy>
        </div>
      </div>
    </div>
    <BuildHooks resource={build} />
  </React.Fragment>;
};

export const getStrategyType = (strategy: BuildStrategyType) => {
  switch (strategy) {
    case BuildStrategyType.Docker:
      return 'dockerStrategy';
    case BuildStrategyType.Custom:
      return 'customStrategy';
    case BuildStrategyType.JenkinsPipeline:
      return 'jenkinsPipelineStrategy';
    case BuildStrategyType.Source:
      return 'sourceStrategy';
    default:
      return null;
  }
};

export const getEnvPath = (props) => {
  const strategyType = getStrategyType(props.obj.spec.strategy.type);
  return strategyType ? ['spec', 'strategy', strategyType] : null;
};

export const BuildEnvironmentComponent = (props) => {
  const {obj} = props;
  const readOnly = obj.kind === 'Build';
  const envPath = getEnvPath(props);
  if (envPath) {
    return <EnvironmentPage
      obj={obj}
      rawEnvData={obj.spec.strategy[getStrategyType(obj.spec.strategy.type)]}
      envPath={getEnvPath(props)}
      readOnly={readOnly} />;
  }
  return <div className="cos-status-box">
    <div className="text-center">{gettext('The environment variable editor does not support build strategy:')} {obj.spec.strategy.type}.
    </div>
  </div>;
};

const pages = [
  navFactory.details(BuildsDetails),
  navFactory.editYaml(),
  navFactory.envEditor(BuildEnvironmentComponent),
  navFactory.logs(BuildLogs),
  navFactory.events(ResourceEventStream)
];

export const BuildsDetailsPage: React.SFC<BuildsDetailsPageProps> = props =>
  <DetailsPage
    {...props}
    breadcrumbsFor={obj => breadcrumbsForOwnerRefs(obj).concat({
      name: 'Build Details',
      path: props.match.url,
    })}
    kind={BuildsReference}
    menuActions={menuActions}
    pages={pages} />;
BuildsDetailsPage.displayName = 'BuildsDetailsPage';

const BuildsHeader = props => <ListHeader>
  <ColHead {...props} className="col-sm-3 col-xs-6" sortField="metadata.name">{gettext('Name')}</ColHead>
  <ColHead {...props} className="col-sm-3 col-xs-6" sortField="metadata.namespace">{gettext('Namespace')}</ColHead>
  <ColHead {...props} className="col-sm-3 hidden-xs" sortField="status.phase">{gettext('Status')}</ColHead>
  <ColHead {...props} className="col-sm-3 hidden-xs" sortField="metadata.creationTimestamp">{gettext('Created')}</ColHead>
</ListHeader>;

const BuildsRow: React.SFC<BuildsRowProps> = ({ obj }) => {
  const statusMap = {
    'New': gettext('New'),
    'Pending': gettext('Pending'),
    'Running': gettext('Running'),
    'Complete': gettext('Complete'),
    'Failed': gettext('Failed'),
    'Error': gettext('Error'),
    'Cancelled': gettext('Cancelled'),
  };
  const getStatusStr = status => {
    return statusMap[status] || status; 
  }
  return <div className="row co-resource-list__item">
    <div className="col-sm-3 col-xs-6 co-resource-link-wrapper">
      <ResourceCog actions={menuActions} kind={BuildsReference} resource={obj} />
      <ResourceLink kind={BuildsReference} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
    </div>
    <div className="col-sm-3 col-xs-6 co-break-word">
      <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
    </div>
    <div className="col-sm-3 hidden-xs">
      {getStatusStr(obj.status.phase)}
    </div>
    <div className="col-sm-3 hidden-xs">
      {fromNow(obj.metadata.creationTimestamp)}
    </div>
  </div>;
};

export const BuildsList: React.SFC = props => <List {...props} Header={BuildsHeader} Row={BuildsRow} />;
BuildsList.displayName = 'BuildsList';

export const buildPhase = build => build.status.phase;

const allPhases = ['New', 'Pending', 'Running', 'Complete', 'Failed', 'Error', 'Cancelled'];

export const BuildsPage: React.SFC<BuildsPageProps> = props => {
  const filters = [{
    type: 'build-status',
    selected: allPhases,
    reducer: buildPhase,
    items: [
      { id: 'New', title: gettext('New') },
      { id: 'Pending', title: gettext('Pending') },
      { id: 'Running', title: gettext('Running') },
      { id: 'Complete', title: gettext('Complete') },
      { id: 'Failed', title: gettext('Failed') },
      { id: 'Error', title: gettext('Error') },
      { id: 'Cancelled', title: gettext('Cancelled') }
    ]
  }];

  return <ListPage
    {...props}
    title={gettext('Builds')}
    kind={BuildsReference}
    ListComponent={BuildsList}
    canCreate={false}
    rowFilters={filters}
  />;
};

BuildsPage.displayName = 'BuildsListPage';

export type BuildsRowProps = {
  obj: any,
};

export type BuildsDetailsProps = {
  obj: any,
};

export type BuildsPageProps = {
  showTitle?: boolean,
  namespace?: string,
  selector?: any,
};

export type BuildsDetailsPageProps = {
  match: any,
};
/* eslint-enable no-undef */
