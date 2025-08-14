// Type declarations for export packages

declare module 'jspdf' {
  export class jsPDF {
    constructor()
    setFontSize(size: number): void
    text(text: string, x: number, y: number): void
    line(x1: number, y1: number, x2: number, y2: number): void
    save(filename: string): void
  }
}

declare module 'xlsx' {
  export const utils: {
    book_new(): any
    aoa_to_sheet(data: any[][]): any
    book_append_sheet(wb: any, ws: any, name: string): void
  }
  export function writeFile(wb: any, filename: string): void
}

declare module 'docx' {
  export class Document {
    constructor(options: any)
  }
  export class Packer {
    static toBlob(doc: Document): Promise<Blob>
  }
  export class Paragraph {
    constructor(options: any)
  }
  export class TextRun {
    constructor(options: any)
  }
  export class Table {
    constructor(options: any)
  }
  export class TableRow {
    constructor(options: any)
  }
  export class TableCell {
    constructor(options: any)
  }
  export const WidthType: {
    PERCENTAGE: string
  }
}
