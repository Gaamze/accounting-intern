import { Injectable, NotFoundException , ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Repository } from 'typeorm';
import { Invoice , InvoiceStatus} from './entities/invoice.entity';
import { CreateAccountDto } from '../accounts/dto/create-account.dto';
import { JournalEntriesService } from '../journal-entries/journal-entries.service';
import { Account } from '../accounts/account.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoices : Repository<Invoice>,

    @InjectRepository (Account)
    private accounts : Repository <Account>,

    private journalEntrieService : JournalEntriesService
  )
  {}

  async create(dto: CreateInvoiceDto) {

     const exists = await this.invoices.findOne({ where: { number: dto.number } });
  if (exists) throw new ConflictException(`Invoice ${dto.number} already exists`);


    const invoice = this.invoices.create({...dto, status: InvoiceStatus.DRAFT})


    return this.invoices.save(invoice);
  }

  findAll() {
    return this.invoices.find();
  }

  async findOne(id: number) {
    const invoice = await this.invoices.findOne({where:{id}});
    if(!invoice)
    {
      throw new NotFoundException('not found');
    }

    return invoice;
  }

  private async getAccount(code: string): Promise<Account> {
    const account = await this.accounts.findOne({ where: { code } });
    if (!account) throw new NotFoundException(`Account ${code} not found`);
    return account;
  }

  /** DRAFT to POSTED*/
  async post(id: number) {
    const invoice = await this.findOne(id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new ConflictException(`Invoice ${invoice.number} is ${invoice.status}, only DRAFT can be posted`);
    }

    const receivable = await this.getAccount('1100');
    const revenue = await this.getAccount('4000');

    await this.journalEntrieService.create({
      date: invoice.issueDate,
      description: `Invoice ${invoice.number}`,
      reference: invoice.number,
      lines: [
        { accountId: receivable.id, debitCents: invoice.amountCents, creditCents: 0 },
        { accountId: revenue.id, debitCents: 0, creditCents: invoice.amountCents },
      ],
    });

    invoice.status = InvoiceStatus.POSTED;
    return this.invoices.save(invoice);
  }

  /** POSTED -> PAID: */
  async pay(id: number,payentDate?:string) {
    const invoice = await this.findOne(id);

    if (invoice.status !== InvoiceStatus.POSTED) {
      throw new ConflictException(`Invoice ${invoice.number} is ${invoice.status}, only POSTED can be paid`);
    }

    const date= payentDate ?? new Date().toISOString().slice(0,10);
    if (invoice.issueDate && date<invoice.issueDate)
    {
      throw new BadRequestException('payment can bot be before issue date');
    }

    const cash = await this.getAccount('1000');
    const receivable = await this.getAccount('1100');

    await this.journalEntrieService.create({
      date,
      // date: new Date().toISOString().slice(0, 10), 
      description: `Payment for invoice ${invoice.number}`,
      reference: invoice.number,
      lines: [
        { accountId: cash.id, debitCents: invoice.amountCents, creditCents: 0 },
        { accountId: receivable.id, debitCents: 0, creditCents: invoice.amountCents },
      ],
    });

    invoice.status = InvoiceStatus.PAID;
    return this.invoices.save(invoice);
  }
}
