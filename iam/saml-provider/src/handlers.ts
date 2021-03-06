import {
    Action,
    BaseResource,
    exceptions,
    handlerEvent,
    OperationStatus,
    Optional,
    ProgressEvent,
    ResourceHandlerRequest,
    SessionProxy,
} from 'cfn-rpdk';
import { ResourceModel } from './models';
import { IAM } from 'aws-sdk';
import {
    CreateSAMLProviderRequest,
    UpdateSAMLProviderRequest,
    DeleteSAMLProviderRequest,
} from 'aws-sdk/clients/iam';

// Use this logger to forward log messages to CloudWatch Logs.
const LOGGER = console;

type CallbackContext = Record<string, any>;

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    public async create(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext
    ): Promise<ProgressEvent> {
        LOGGER.info('create');
        LOGGER.info(callbackContext);
        const model: ResourceModel = request.desiredResourceState;
        const progress = ProgressEvent.progress<
            ProgressEvent<ResourceModel, CallbackContext>
        >(model);

        LOGGER.info(request);
        LOGGER.info(model);

        if (session instanceof SessionProxy) {
            const client: IAM = session.client('IAM') as IAM;
            const createSamlProviderRequest: CreateSAMLProviderRequest = {
                Name: model.name,
                SAMLMetadataDocument: model.metadataDocument,
            };
            LOGGER.info(createSamlProviderRequest);
            const response = await client
                .createSAMLProvider(createSamlProviderRequest)
                .promise();

            LOGGER.info(response);
            model.arn = response.SAMLProviderArn;
        } else {
            throw new exceptions.InvalidCredentials(
                'no aws session found - did you forget to register the execution role?'
            );
        }
        return progress;
    }

    /**
     * CloudFormation invokes this handler when the resource is updated
     * as part of a stack update operation.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     */
    @handlerEvent(Action.Update)
    public async update(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext
    ): Promise<ProgressEvent> {
        LOGGER.info('update');
        LOGGER.info(callbackContext);
        const model: ResourceModel = request.desiredResourceState;
        const progress = ProgressEvent.progress<
            ProgressEvent<ResourceModel, CallbackContext>
        >(model);

        LOGGER.info(request);
        LOGGER.info(model);

        if (session instanceof SessionProxy) {
            const client: IAM = session.client('IAM') as IAM;
            const updateSamlProviderRequest: UpdateSAMLProviderRequest = {
                SAMLProviderArn: model.arn,
                SAMLMetadataDocument: model.metadataDocument,
            };

            LOGGER.info(updateSamlProviderRequest);
            const response = await client
                .updateSAMLProvider(updateSamlProviderRequest)
                .promise();

            LOGGER.info(response);
        } else {
            throw new exceptions.InvalidCredentials(
                'no aws session found - did you forget to register the execution role?'
            );
        }
        return progress;
    }

    /**
     * CloudFormation invokes this handler when the resource is deleted, either when
     * the resource is deleted from the stack as part of a stack update operation,
     * or the stack itself is deleted.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     */
    @handlerEvent(Action.Delete)
    public async delete(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext
    ): Promise<ProgressEvent> {
        LOGGER.info('delete');
        LOGGER.info(callbackContext);

        const model: ResourceModel = request.desiredResourceState;
        const progress = ProgressEvent.progress<
            ProgressEvent<ResourceModel, CallbackContext>
        >();

        if (session instanceof SessionProxy) {
            const client: IAM = session.client('IAM') as IAM;
            const deleteSamlProviderRequest: DeleteSAMLProviderRequest = {
                SAMLProviderArn: model.arn,
            };

            LOGGER.info(deleteSamlProviderRequest);
            const response = await client
                .deleteSAMLProvider(deleteSamlProviderRequest)
                .promise();
            progress.status = OperationStatus.Success;
            LOGGER.info(response);
        } else {
            throw new exceptions.InvalidCredentials(
                'no aws session found - did you forget to register the execution role?'
            );
        }
        return progress;
    }

    /**
     * CloudFormation invokes this handler as part of a stack update operation when
     * detailed information about the resource's current state is required.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     */
    @handlerEvent(Action.Read)
    public async read(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext
    ): Promise<ProgressEvent> {
        const model: ResourceModel = request.desiredResourceState;
        // TODO: put code here
        if (session instanceof SessionProxy) {
            const client: IAM = session.client('IAM') as IAM;
        } else {
            throw new exceptions.InvalidCredentials(
                'no aws session found - did you forget to register the execution role?'
            );
        }
        const progress = ProgressEvent.success<
            ProgressEvent<ResourceModel, CallbackContext>
        >(model);
        return progress;
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
