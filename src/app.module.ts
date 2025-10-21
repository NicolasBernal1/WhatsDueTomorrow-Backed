import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql', 
        host: configService.get<string>('DB_HOST'), 
        port: configService.get<number>('DB_PORT'), 
        username: configService.get<string>('DB_USERNAME'), 
        password: configService.get<string>('DB_PASSWORD'), 
        database: configService.get<string>('DB_DATABASE'), 
        autoLoadEntities: true, // Descubre entidades automáticamente 
        synchronize: true, // ¡Solo para desarrollo! 
      })
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
