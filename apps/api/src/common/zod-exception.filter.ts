import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { ZodValidationException } from "nestjs-zod";
import { z } from "zod";

@Catch(ZodValidationException)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodValidationException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();

    response.status(400).json({
      code: "VALIDATION_ERROR",
      errors: z.flattenError(exception.getZodError() as z.ZodError),
    });
  }
}
