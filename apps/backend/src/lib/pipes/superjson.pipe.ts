import { PipeTransform } from "@nestjs/common";
import { deserialize } from "superjson";

export class SuperjsonPipe implements PipeTransform {
    transform(value: any) {
        if ("json" in value) {
            return deserialize(value);
        }
    }
}
