import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CardsRepository } from "./cards.repository";
import { CardsController } from "./cards.controller";
import { CreateCardService } from "./create-card.service";

@Module({
  imports: [AuthModule],
  controllers: [CardsController],
  providers: [CreateCardService, CardsRepository],
})
export class CardsModule {}
