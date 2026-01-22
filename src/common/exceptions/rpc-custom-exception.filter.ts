// import {
//   Catch,
//   ArgumentsHost,
//   HttpStatus,
//   Logger,
//   ExceptionFilter,
// } from '@nestjs/common';
// import { RpcException } from '@nestjs/microservices';
// import { Request, Response } from 'express';

// type errorTypeRpc = {
//   status: number;
//   message: string;
// };

// @Catch(RpcException, Error) // Catch RpcException and generic Errors (including EmptyResponseException)
// export class RpcCustomExceptionFilter implements ExceptionFilter {
//   private readonly logger = new Logger(RpcCustomExceptionFilter.name);

//   catch(exception: RpcException | Error, host: ArgumentsHost) {
//     const ctx = host.switchToHttp(); // Switch to HTTP context
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();
//     if (!response || !request) {
//       // If not an HTTP context, do nothing
//       return {};
//     }

//     // Check if it's an EmptyResponseException from NATS
//     if (
//       exception.message.includes('Empty response') &&
//       exception.message.includes('no subscribers')
//     ) {
//       const errorResponse = {
//         statusCode: HttpStatus.SERVICE_UNAVAILABLE,
//         timestamp: new Date().toISOString(),
//         path: request.url,
//         method: request.method,
//         message:
//           'Service temporarily unavailable. No microservice is listening to this request.',
//       };

//       this.logger.error(
//         `EmptyResponseException: ${request.method} ${request.url} - ${exception.message}`,
//       );

//       return response
//         .status(HttpStatus.SERVICE_UNAVAILABLE)
//         .json(errorResponse);
//     }

//     // Handle RpcException
//     if (exception instanceof RpcException) {
//       const rpcError = exception.getError();
//       console.log(rpcError);

//       if (
//         typeof rpcError === 'object' &&
//         'status' in rpcError &&
//         'message' in rpcError
//       ) {
//         const status: number = isNaN(+(rpcError as errorTypeRpc).status)
//           ? 400
//           : +(rpcError as errorTypeRpc).status;
//         const message: string = (rpcError as errorTypeRpc).message;

//         const errorResponse = {
//           statusCode: status,
//           timestamp: new Date().toISOString(),
//           path: request.url,
//           method: request.method,
//           message,
//         };

//         // Log error details
//         this.logger.error(
//           `RpcException: ${status} - ${request.method} ${request.url} - ${message}`,
//         );
//         return response.status(status).json(errorResponse);
//       }
//     }

//     // Handle any other errors
//     const errorResponse = {
//       statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
//       timestamp: new Date().toISOString(),
//       path: request.url,
//       method: request.method,
//       message: exception.message || 'Internal server error',
//     };

//     this.logger.error(
//       `Unhandled Exception: ${errorResponse.statusCode} - ${request.method} ${request.url} - ${errorResponse.message}`,
//     );

//     response.status(errorResponse.statusCode).json(errorResponse);
//   }
// }
