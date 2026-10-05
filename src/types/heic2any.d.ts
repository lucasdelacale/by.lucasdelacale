declare module 'heic2any' {
  type ConversionOptions = {
    blob: Blob;
    toType?: string;
    quality?: number;
  };

  function heic2any(options: ConversionOptions): Promise<Blob | Blob[]>;

  export default heic2any;
}
