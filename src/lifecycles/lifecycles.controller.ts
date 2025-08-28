import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LifecyclesService } from './lifecycles.service';
import { JwtAuthGuard } from 'src/auth/guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { saveFile } from 'src/shared/utils/file-system';
import { ConfigService } from '@nestjs/config';

@Controller('lifecycles')
export class LifecyclesController {
  constructor(
    private readonly lifecyclesService: LifecyclesService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('pic'))
  async test(
    @Body() body: { id: number; eol?: Date; eos?: Date },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('body:', body);
    console.log('file:', file);
    let fileName = undefined;
    if (file && file.size !== 0)
      fileName = await saveFile(this.configService, file, 'models');
    return {
      ...body,
      pic: fileName,
    };
  }

  @Get('count')
  getCount() {
    return [
      {
        id: 1,
        group: 'Group A',
        eol: new Date('2023-06-29'),
        eos: new Date('2025-12-31'),
        models: ['Model A1', 'Model A2'],
        count: 17,
      },
      { id: 2, group: 'Group B', models: [], count: 0 },
      {
        id: 3,
        group: 'Group C',
        eol: new Date('2023-06-30'),
        models: ['Model C1', 'Model C2', 'Model C3'],
        count: 8,
      },
      {
        id: 4,
        group: 'Group D',
        eos: new Date('2025-01-01'),
        models: [],
        count: 0,
      },
      {
        id: 5,
        group: 'Group E',
        eol: new Date(),
        eos: new Date(),
        models: [],
        count: 0,
      },
      {
        id: 6,
        group: 'Group F',
        eol: new Date('2024-05-15'),
        eos: new Date('2025-05-15'),
        models: ['Model F1'],
        count: 5,
      },
      { id: 7, group: 'Group G', models: [], count: 0 },
      {
        id: 8,
        group: 'Group H',
        eol: new Date('2023-11-20'),
        models: ['Model H1', 'Model H2'],
        count: 2,
      },
      {
        id: 9,
        group: 'Group I',
        eos: new Date('2024-08-30'),
        models: [],
        count: 0,
      },
      {
        id: 10,
        group: 'Group J',
        eol: new Date('2025-03-10'),
        eos: new Date('2026-03-10'),
        models: ['Model J1', 'Model J2', 'Model J3'],
        count: 7,
      },
      {
        id: 11,
        group: 'Group K',
        eol: new Date('2025-04-15'),
        eos: new Date('2026-04-15'),
        models: ['Model K1'],
        count: 4,
      },
      {
        id: 12,
        group: 'Group L',
        eol: new Date('2024-09-30'),
        eos: new Date('2025-09-30'),
        models: ['Model L1', 'Model L2'],
        count: 6,
      },
      {
        id: 13,
        group: 'Group M',
        eol: new Date('2023-12-31'),
        eos: new Date('2024-12-31'),
        models: ['Model M1', 'Model M2', 'Model M3'],
        count: 9,
      },
      {
        id: 14,
        group: 'Group N',
        eol: new Date('2025-02-28'),
        eos: new Date('2026-02-28'),
        models: ['Model N1'],
        count: 2,
      },
      {
        id: 15,
        group: 'Group O',
        eol: new Date('2024-11-15'),
        eos: new Date('2025-11-15'),
        models: ['Model O1', 'Model O2'],
        count: 5,
      },
      {
        id: 16,
        group: 'Group P',
        eol: new Date('2023-10-10'),
        eos: new Date('2024-10-10'),
        models: ['Model P1', 'Model P2', 'Model P3'],
        count: 8,
      },
      {
        id: 17,
        group: 'Group Q',
        eol: new Date('2025-01-01'),
        eos: new Date('2026-01-01'),
        models: ['Model Q1'],
        count: 3,
      },
      {
        id: 18,
        group: 'Group R',
        eol: new Date('2024-06-30'),
        eos: new Date('2025-06-30'),
        models: ['Model R1', 'Model R2'],
        count: 7,
      },
      {
        id: 19,
        group: 'Group S',
        eol: new Date('2023-08-15'),
        eos: new Date('2024-08-15'),
        models: ['Model S1'],
        count: 1,
      },
      {
        id: 20,
        group: 'Group T',
        eol: new Date('2026-05-20'),
        eos: new Date('2026-05-20'),
        models: ['Model T1', 'Model T2', 'Model T3'],
        count: 10,
      },
    ];
  }

  @Get()
  get() {
    return [
      {
        id: 1,
        group: 'Group A',
        eol: new Date('2024-12-31'),
        eos: new Date('2025-12-31'),
        models: ['Model A1', 'Model A2'],
      },
      { id: 2, group: 'Group B', models: [] },
      {
        id: 3,
        group: 'Group C',
        eol: new Date('2023-06-30'),
        models: ['Model C1', 'Model C2', 'Model C3'],
      },
      { id: 4, group: 'Group D', eos: new Date('2025-01-01'), models: [] },
      { id: 5, group: 'Group E', eol: new Date(), eos: new Date(), models: [] },
    ];
  }
}
