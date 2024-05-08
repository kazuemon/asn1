import * as v from "valibot";
import { BaseSchema } from "./base";
import { Asn1Data } from "..";

export class LazySchema<ToType, FromType>
  implements BaseSchema<ToType, FromType>
{
  constructor(
    private func: (...rest: any[]) => NoInfer<BaseSchema<ToType, FromType>>,
  ) {}

  getAsn1Schema(): v.BaseSchema {
    return v.lazy(() => this.func().getAsn1Schema());
  }

  getNativeSchema(): v.BaseSchema {
    return v.lazy(() => this.func().getNativeSchema());
  }

  decode(data: Asn1Data): ToType {
    return this.func().decode(data);
  }

  encode(obj: FromType): Uint8Array {
    return this.func().encode(obj);
  }
}

export const lazy = <ToType = never, FromType = never>(
  func: (...rest: any[]) => NoInfer<BaseSchema<ToType, FromType>>,
) => new LazySchema<ToType, FromType>(func);
