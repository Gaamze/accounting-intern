import { Controller, Get, Post, Body, Patch, Param, Delete ,ParseIntPipe} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PayInvoiceDto } from './dto/pay-invoice.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(dto);
  }

  @Get()
  findAll() {
    return this.invoicesService.findAll();
  }

 @Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.invoicesService.findOne(id);
}

@Post(':id/post')
post(@Param('id', ParseIntPipe) id: number) {
  return this.invoicesService.post(id);
}

@Post(':id/pay')
pay(@Param('id', ParseIntPipe) id: number, @Body() dto:PayInvoiceDto) {
  return this.invoicesService.pay(id, dto?.paymentDate);
}


 
}
