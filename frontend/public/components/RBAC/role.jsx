import * as _ from 'lodash-es';
import * as React from 'react';
import * as fuzzy from 'fuzzysearch';
// import { Link } from 'react-router-dom';

import { ColHead, DetailsPage, List, ListHeader, MultiListPage, ResourceRow, TextFilter } from '../factory';
import { Cog, SectionHeading, MsgBox, navFactory, ResourceCog, ResourceLink, Timestamp, gettext } from '../utils';
import { BindingName, BindingsList, RulesList } from './index';
import { flatten as bindingsFlatten } from './bindings';
import { flagPending, connectToFlags, FLAGS } from '../../features';

export const isSystemRole = role => _.startsWith(role.metadata.name, 'system:');

// const addHref = (name, ns) => ns ? `/k8s/ns/${ns}/roles/${name}/add-rule` : `/k8s/cluster/clusterroles/${name}/add-rule`;

export const roleKind = role => role.metadata.namespace ? 'Role' : 'ClusterRole';

const menuActions = [
  // This page is temporarily disabled until we update the safe resources list.
  // (kind, role) => ({
  //   label: 'Add Rule...',
  //   href: addHref(role.metadata.name, role.metadata.namespace),
  // }),
  (kind, role) => ({
    label: 'Add Role Binding...',
    href: `/k8s/cluster/rolebindings/new?rolekind=${roleKind(role)}&rolename=${role.metadata.name}`,
  }),
  Cog.factory.Edit,
  Cog.factory.Delete,
];

const Header = props => <ListHeader>
  <ColHead {...props} className="col-xs-6" sortField="metadata.name">{gettext('Name')}</ColHead>
  <ColHead {...props} className="col-xs-6" sortField="metadata.namespace">{gettext('Namespace')}</ColHead>
</ListHeader>;

const Row = ({obj: role}) => <div className="row co-resource-list__item">
  <div className="col-xs-6 co-resource-link-wrapper">
    <ResourceCog actions={menuActions} kind={roleKind(role)} resource={role} />
    <ResourceLink kind={roleKind(role)} name={role.metadata.name} namespace={role.metadata.namespace} />
  </div>
  <div className="col-xs-6 co-break-word">
    {role.metadata.namespace ? <ResourceLink kind="Namespace" name={role.metadata.namespace} /> : 'all'}
  </div>
</div>;

class Details extends React.Component {
  constructor (props) {
    super(props);
    this.state = {};
    this.changeFilter = e => this.setState({ruleFilter: e.target.value});
  }

  render () {
    const ruleObj = this.props.obj;
    const {creationTimestamp, name, namespace} = ruleObj.metadata;
    const {ruleFilter} = this.state;

    let rules = ruleObj.rules;
    if (ruleFilter) {
      const fuzzyCaseInsensitive = (a, b) => fuzzy(_.toLower(a), _.toLower(b));
      const searchKeys = ['nonResourceURLs', 'resources', 'verbs'];
      rules = rules.filter(rule => searchKeys.some(k => _.some(rule[k], v => fuzzyCaseInsensitive(ruleFilter, v))));
    }

    return <div>
      <div className="co-m-pane__body">
        <SectionHeading text={gettext('Role Overview')} />
        <div className="row">
          <div className="col-xs-6">
            <dl className="co-m-pane__details">
              <dt>{gettext('Role Name')}</dt>
              <dd>{name}</dd>
              {namespace && <div>
                <dt>{gettext('Namespace')}</dt>
                <dd><ResourceLink kind="Namespace" name={namespace} /></dd>
              </div>}
            </dl>
          </div>
          <div className="col-xs-6">
            <dl className="co-m-pane__details">
              <dt>{gettext('Created At')}</dt>
              <dd><Timestamp timestamp={creationTimestamp} /></dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={gettext('Rules')} />
        <div className="co-m-pane__filter-bar co-m-pane__filter-bar--alt">
          {/* This page is temporarily disabled until we update the safe resources list.
          <div className="co-m-pane__filter-bar-group">
            <Link to={addHref(name, namespace)} className="co-m-primary-action">
              <button className="btn btn-primary">Add Rule</button>
            </Link>
          </div>
          */}
          <div className="co-m-pane__filter-bar-group co-m-pane__filter-bar-group--filter">
            <TextFilter label={gettext('Rules by action or resource')} onChange={this.changeFilter} />
          </div>
        </div>
        <RulesList rules={rules} name={name} namespace={namespace} />
      </div>
    </div>;
  }
}

const BindingHeader = props => <ListHeader>
  <ColHead {...props} className="col-xs-4" sortField="metadata.name">{gettext('Name')}</ColHead>
  <ColHead {...props} className="col-xs-2" sortField="subject.kind">{gettext('Subject Kind')}</ColHead>
  <ColHead {...props} className="col-xs-4" sortField="subject.name">{gettext('Subject Name')}</ColHead>
  <ColHead {...props} className="col-xs-2" sortField="metadata.namespace">{gettext('Namespace')}</ColHead>
</ListHeader>;

const BindingRow = ({obj: binding}) => <ResourceRow obj={binding}>
  <div className="col-xs-4">
    <BindingName binding={binding} />
  </div>
  <div className="col-xs-2">
    {binding.subject.kind}
  </div>
  <div className="col-xs-4">
    {binding.subject.name}
  </div>
  <div className="col-xs-2">
    {binding.namespace || 'all'}
  </div>
</ResourceRow>;

const BindingsListComponent = props => <BindingsList {...props} Header={BindingHeader} Row={BindingRow} />;

export const BindingsForRolePage = (props) => {
  const {match: {params: {name, ns}}, obj:{kind}} = props;
  let resources = [{kind: 'RoleBinding', namespaced: true}];
  if (!ns) {
    resources.push({kind: 'ClusterRoleBinding', namespaced: false, optional: true});
  }
  return <MultiListPage
    canCreate={true}
    createButtonText={gettext('Create Binding')}
    createProps={{to: `/k8s/${ns ? `ns/${ns}` : 'cluster'}/rolebindings/new?rolekind=${kind}&rolename=${name}`}}
    ListComponent={BindingsListComponent}
    staticFilters={[{'role-binding-roleRef': name}]}
    resources={resources}
    textFilter="role-binding"
    filterLabel={gettext('Role Bindings by role or subject')}
    namespace={ns}
    flatten={bindingsFlatten} />;
};

export const RolesDetailsPage = props => <DetailsPage
  {...props}
  pages={[navFactory.details(Details), navFactory.editYaml(), {href: 'bindings', name: 'Role Bindings', component: BindingsForRolePage}]}
  menuActions={menuActions} />;

export const ClusterRolesDetailsPage = RolesDetailsPage;

const EmptyMsg = () => <MsgBox title={gettext('No Roles Found')} detail={gettext('Roles grant access to types of objects in the cluster. Roles are applied to a team or user via a Role Binding.')} />;

const RolesList = props => <List {...props} EmptyMsg={EmptyMsg} Header={Header} Row={Row} />;

export const roleType = role => {
  if (!role) {
    return undefined;
  }
  if (isSystemRole(role)) {
    return 'system';
  }
  return role.metadata.namespace ? 'namespace' : 'cluster';
};

export const RolesPage = connectToFlags(FLAGS.PROJECTS_AVAILBLE, FLAGS.PROJECTS_AVAILBLE)(({namespace, showTitle, flags}) => {
  const projectsAvailable = !flagPending(flags.PROJECTS_AVAILBLE) && flags.PROJECTS_AVAILBLE;
  return <MultiListPage
    ListComponent={RolesList}
    canCreate={true}
    showTitle={showTitle}
    namespace={namespace}
    createButtonText={gettext('Create Role')}
    createProps={{to: `/k8s/ns/${namespace || 'default'}/roles/new`}}
    filterLabel={gettext('Roles by name')}
    flatten={resources => _.flatMap(resources, 'data').filter(r => !!r)}
    resources={[
      {kind: 'Role', namespaced: true, optional: !projectsAvailable},
      {kind: 'ClusterRole', namespaced: false, optional: true},
    ]}
    rowFilters={[{
      type: 'role-kind',
      selected: ['cluster', 'namespace'],
      reducer: roleType,
      items: [
        {id: 'cluster', title: 'Cluster-wide Roles'},
        {id: 'namespace', title: 'Namespace Roles'},
        {id: 'system', title: 'System Roles'},
      ],
    }]}
    title="Roles"
  />;
});
