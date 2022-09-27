import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { JSONSchema7 } from 'json-schema';
import { axios } from '../../../../lib/axios';
import { JSONValue } from '../../../standard/JSONSchemaState';
import { showNotification } from '@mantine/notifications';
import { rootStore } from '../../../index';

export const schema = {
  // export const configSchema: JSONSchema7 = {
  title: 'Create Project Test',
  type: 'object',
  properties: {
    name: { type: 'string' },
    version: { type: 'string' }
  },
  required: ['name', 'version']
} as const;

type SchemaType = FromSchema<typeof schema>;

export const createProjectSchema = new JSONSchemaState<SchemaType>({
  //@ts-ignore
  schema,
  uiSchema: {
    'ui:submitButtonOptions': {
      norender: false,
      submitText: 'Submit'
    }
  },
  reactive: true,
  afterSubmit: async (e) => {
    const res = await axios.request({
      method: 'post',
      url: '/srv-applet-mgr/v0/project',
      data: e.formData
    });
    if (res.data) {
      await showNotification({ message: 'create project successed' });
    }
    rootStore.w3s.projects.call();
  },
  value: new JSONValue<SchemaType>({
    name: 'project_01',
    version: '0.0.1'
  })
});