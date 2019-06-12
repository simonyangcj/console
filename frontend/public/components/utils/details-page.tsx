import * as React from 'react';
import * as _ from 'lodash-es';

import { Cog, kindObj, LabelList, ResourceLink, Selector, Timestamp } from './index';
import { referenceForOwnerRef, K8sResourceKind, referenceFor } from '../../module/k8s';
import { gettext } from './gettext'

export const pluralize = (i: number, singular: string, plural: string = `${singular}s`) => `${i || 0} ${i === 1 ? singular : plural}`;

export const detailsPage = <T extends {}>(Component: React.ComponentType<T>) => function DetailsPage(props: T) {
  return <Component {...props} />;
};

export const ResourceSummary: React.SFC<ResourceSummaryProps> = ({children, resource, showPodSelector = true, showNodeSelector = true, showAnnotations = true, podSelector = 'spec.selector'}) => {
  const { metadata, type } = resource;
  const owners = (_.get(metadata, 'ownerReferences') || [])
    .map((o, i) => <ResourceLink key={i} kind={referenceForOwnerRef(o)} name={o.name} namespace={metadata.namespace} title={o.uid} />);
  
  const getAnnotations = (count: number) => {
    return count === 1 ? `1 ${gettext('Annotation')}` : gettext(`%s Annotations`, count.toString());
  };
  const getOwner =  (count: number) => {
    return count === 1 ? `1 ${gettext('Owner')}` : gettext(`%s Owners`, count.toString());
  };

  return <dl className="co-m-pane__details">
    <dt>{gettext('Name')}</dt>
    <dd>{metadata.name || '-'}</dd>
    { metadata.namespace ? <dt>{gettext('Namespace')}</dt> : null }
    { metadata.namespace ? <dd><ResourceLink kind="Namespace" name={metadata.namespace} title={metadata.uid} namespace={null} /></dd> : null }
    { type ? <dt>{gettext('Type')}</dt> : null }
    { type ? <dd>{type}</dd> : null }
    <dt>{gettext('Labels')}</dt>
    <dd><LabelList kind={referenceFor(resource)} labels={metadata.labels} /></dd>
    {showPodSelector && <dt>{gettext('Pod Selector')}</dt>}
    {showPodSelector && <dd><Selector selector={_.get(resource, podSelector)} namespace={_.get(resource, 'metadata.namespace')} /></dd>}
    {showNodeSelector && <dt>{gettext('Node Selector')}</dt>}
    {showNodeSelector && <dd><Selector kind="Node" selector={_.get(resource, 'spec.template.spec.nodeSelector')} /></dd>}
    {showAnnotations && <dt>{gettext('Annotations')}</dt>}
    {showAnnotations && <dd><a className="co-m-modal-link" onClick={Cog.factory.ModifyAnnotations(kindObj(resource.kind), resource).callback}>{getAnnotations(_.size(metadata.annotations))}</a></dd>}
    {children}
    <dt>{gettext('Created At')}</dt>
    <dd><Timestamp timestamp={metadata.creationTimestamp} /></dd>
    { owners.length ? <dt>{getOwner(owners.length)}</dt> : null }
    { owners.length ? <dd>{ owners }</dd> : null }
  </dl>;
};

export const ResourcePodCount: React.SFC<ResourcePodCountProps> = ({resource}) => <dl>
  <dt>{gettext('Current Count')}</dt>
  <dd>{resource.status.replicas || 0}</dd>
  <dt>{gettext('Desired Count')}</dt>
  <dd>{resource.spec.replicas || 0}</dd>
</dl>;

/* eslint-disable no-undef */
export type ResourceSummaryProps = {
  resource: K8sResourceKind;
  showPodSelector?: boolean;
  showNodeSelector?: boolean;
  showAnnotations?: boolean;
  podSelector?: string;
  children?: JSX.Element[];
};

export type ResourcePodCountProps = {
  resource: K8sResourceKind;
};
/* eslint-enable no-undef */

ResourceSummary.displayName = 'ResourceSummary';
ResourcePodCount.displayName = 'ResourcePodCount';
