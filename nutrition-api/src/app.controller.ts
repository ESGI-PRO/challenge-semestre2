import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('nutrition')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    //deploy -- test 5
    return this.appService.getHello();
  }
}
