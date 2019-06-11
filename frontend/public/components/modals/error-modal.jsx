import * as React from 'react';

import {createModalLauncher, ModalTitle, ModalBody, ModalFooter} from '../factory/modal';
import { gettext } from '../utils/gettext';

export const errorModal = createModalLauncher(
  ({error, cancel}) => {
    return (
      <div>
        <ModalTitle>{gettext('Error')}</ModalTitle>
        <ModalBody>{error}</ModalBody>
        <ModalFooter inProgress={false} errorMessage=""><button type="button" onClick={(e) => cancel(e)} className="btn btn-default">{gettext('OK')}</button></ModalFooter>
      </div>
    );
  }
);
