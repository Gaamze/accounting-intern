import { Body, Controller, Get,Query, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { ListJournalEntriesQueryDto } from './dto/ListJournalEntriesQueryDto';
import { JournalEntriesService } from './journal-entries.service';
import { ReverseJournalEntryDto } from './dto/reverse-journal-entry.dto';


@ApiTags('journal-entries')
@Controller('journal-entries')
export class JournalEntriesController {
  constructor(private readonly service: JournalEntriesService) {}

  @Post()
  create(@Body() dto: CreateJournalEntryDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: ListJournalEntriesQueryDto
) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post(':id/reverse')
  reverse(@Param('id', ParseIntPipe) id: number,@Body() dto: ReverseJournalEntryDto )
  {
        return this.service.reverse(id, dto);
  }

}
