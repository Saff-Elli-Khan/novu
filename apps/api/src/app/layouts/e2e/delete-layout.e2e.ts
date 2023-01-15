import { UserSession } from '@novu/testing';
import { expect } from 'chai';

import { TemplateVariableTypeEnum } from '../types';

const BASE_PATH = '/v1/layouts';

describe('Delete a layout - /layouts/:layoutId (DELETE)', async () => {
  let session: UserSession;

  before(async () => {
    session = new UserSession();
    await session.initialize();
  });

  it('should soft delete the requested layout successfully if exists in the database for that user', async () => {
    const layoutName = 'layout-name-deletion';
    const layoutDescription = 'Amazing new layout';
    const content = [
      {
        type: 'text',
        content: 'This are the text contents of the template for {{firstName}}',
        styles: { textAlign: 'left' },
      },
      {
        type: 'button',
        content: 'SIGN UP',
        url: 'https://url-of-app.com/{{urlVariable}}',
      },
    ];
    const variables = [
      { name: 'firstName', type: TemplateVariableTypeEnum.STRING, defaultValue: 'John', required: false },
    ];
    const isDefault = true;
    const response = await session.testAgent.post(BASE_PATH).send({
      name: layoutName,
      description: layoutDescription,
      content,
      variables,
      isDefault,
    });

    expect(response.statusCode).to.eql(201);

    const { body } = response;
    const createdLayout = body.data;
    expect(createdLayout._id).to.exist;
    expect(createdLayout._id).to.be.string;

    const url = `${BASE_PATH}/${createdLayout._id}`;
    const getResponse = await session.testAgent.delete(url);

    expect(getResponse.statusCode).to.eql(204);
    expect(getResponse.body).to.eql({});

    const checkIfDeletedResponse = await session.testAgent.get(url);
    expect(checkIfDeletedResponse.statusCode).to.eql(404);
  });

  it('should throw a not found error when the layout ID to soft delete does not exist in the database', async () => {
    const nonExistingLayoutId = 'ab12345678901234567890ab';
    const url = `${BASE_PATH}/${nonExistingLayoutId}`;
    const { body } = await session.testAgent.delete(url);

    expect(body.statusCode).to.equal(404);
    expect(body.message).to.eql(
      `Layout not found for id ${nonExistingLayoutId} in the environment ${session.environment._id}`
    );
    expect(body.error).to.eql('Not Found');
  });
});
