import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected override async throwThrottlingException(
    _context: ExecutionContext,
  ): Promise<void> {
    throw new HttpException(
      {
        code: "RATE_LIMITED",
        message: "Too many attempts. Try again shortly.",
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
