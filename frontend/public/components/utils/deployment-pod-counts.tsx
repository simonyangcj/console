import * as _ from 'lodash-es';
import * as React from 'react';
import { Tooltip } from './tooltip';

import { K8sKind, K8sResourceKind } from '../../module/k8s';
import { SafetyFirst } from '../safety-first';
import { configureReplicaCountModal } from '../modals';
import { LoadingInline, pluralize, gettext } from './';


/* eslint-disable no-undef, no-unused-vars */
type DPCProps = {
  resource: K8sResourceKind;
  resourceKind: K8sKind;
};

type DPCState = {
  desiredCount: number,
  waitingForUpdate: boolean,
};
/* eslint-enable no-undef, no-unused-vars */

// Common representation of desired / up-to-date / matching pods for Deployment like things
export class DeploymentPodCounts extends SafetyFirst<DPCProps, DPCState> {
  /* eslint-disable no-undef, no-unused-vars */
  openReplicaCountModal: any;
  /* eslint-enable no-undef, no-unused-vars */

  constructor(props) {
    super(props);

    this.state = {
      desiredCount: -1,
      waitingForUpdate: false
    };

    this.openReplicaCountModal = event => {
      event.preventDefault();
      event.target.blur();

      const {resourceKind, resource} = this.props;

      configureReplicaCountModal({
        resourceKind, resource,
        invalidateState: (waitingForUpdate, desiredCount) => this.setState({waitingForUpdate, desiredCount}),
      });
    };
  }

  static getDerivedStateFromProps(nextProps, nextState) {
    if (!nextState.waitingForUpdate) {
      return null;
    }

    if (_.get(nextProps, 'resource.spec.replicas') !== nextState.desiredCount) {
      return null;
    }

    return { waitingForUpdate: false, desiredCount: -1 };
  }

  render () {
    const { resource, resourceKind } = this.props;
    const { spec, status } = resource;

    return <div className="co-m-pane__body-group">
      <div className="co-detail-table">
        <div className="co-detail-table__row row">
          <div className="co-detail-table__section col-sm-3">
            <dl className="co-m-pane__details">
              <dt className="co-detail-table__section-header">{gettext('Desired Count')}</dt>
              <dd>
                {
                  this.state.waitingForUpdate
                    ? <LoadingInline />
                    : <a className="co-m-modal-link" href="#" onClick={this.openReplicaCountModal}>{ pluralize(spec.replicas, 'pod') }</a>
                }
              </dd>
            </dl>
          </div>
          <div className="co-detail-table__section col-sm-3">
            <dl className="co-m-pane__details">
              <dt className="co-detail-table__section-header">{gettext('Up-to-date Count')}</dt>
              <dd>
                <Tooltip content={gettext('Total number of non-terminated pods targeted by this %s that have the desired template spec.', resourceKind.label)}>
                  {pluralize(status.updatedReplicas, 'pod')}
                </Tooltip>
              </dd>
            </dl>
          </div>
          <div className="co-detail-table__section co-detail-table__section--last col-sm-6">
            <dl className="co-m-pane__details">
              <dt className="co-detail-table__section-header">{gettext('Matching Pods')}</dt>
              <dd>
                <Tooltip content={gettext('Total number of non-terminated pods targeted by this %s (their labels match the selector).', resourceKind.label)}>
                  {pluralize(status.replicas, 'pod')}
                </Tooltip>
              </dd>
            </dl>
            <div className="co-detail-table__bracket"></div>
            <div className="co-detail-table__breakdown">
              <Tooltip content={gettext('Total number of available pods (ready for at least minReadySeconds) targeted by this deployment.')}>
                {status.availableReplicas || 0} {gettext('available')}
              </Tooltip>
              <Tooltip content={gettext('Total number of unavailable pods targeted by this %s.', resourceKind.label)}>{status.unavailableReplicas || 0} {gettext('unavailable')}</Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>;
  }
}
