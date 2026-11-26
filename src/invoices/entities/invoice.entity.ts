import { Entity, PrimaryGeneratedColumn,Column    } from "typeorm";



export enum InvoiceStatus {
    DRAFT='DRAFT',
    POSTED ='POSTED',
    PAID ='PAID',
 }


@Entity ('invoices')
export class Invoice {
    @PrimaryGeneratedColumn()
    id:number;


    @Column({unique: true})
    number:string;


    @Column()
    customerName: string;


    @Column({type: 'integer'})
    amountCents : number;

    @Column({type: 'date'})
    issueDate:string;

    @Column({type: 'date'})
    dueDate:string;

    @Column({type: 'simple-enum', enum:InvoiceStatus, default:InvoiceStatus.DRAFT})
    status:InvoiceStatus;

}

