import * as React from 'react';
import * as PropTypes from 'prop-types';

import { makeNodeUnschedulable } from '../../module/k8s/node';
import {createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter} from '../factory/modal';
import {PromiseComponent, gettext} from '../utils';

class UnscheduleNodeModal extends PromiseComponent {
  constructor(props) {
    super(props);
    this._submit = this._submit.bind(this);
    this._cancel = this.props.cancel.bind(this);
  }

  _submit(event) {
    event.preventDefault();

    this.handlePromise(makeNodeUnschedulable(this.props.resource))
      .then(this.props.close)
      .catch((error) => {
        throw error;
      });
  }

  render() {
    return <form onSubmit={this._submit} name="form">
      <ModalTitle>{gettext('Mark as Unschedulable')}</ModalTitle>
      <ModalBody>
        {gettext('Unschedulable nodes won\' accept new pods. This is useful for scheduling maintenance or preparing to decommission a node.')}
      </ModalBody>
      <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText={gettext('Mark Unschedulable')} cancel={this._cancel} />
    </form>;
  }
}

UnscheduleNodeModal.propTypes = {
  resource: PropTypes.object.isRequired,
};

export const configureUnschedulableModal = createModalLauncher(UnscheduleNodeModal);
