import { ENUM_PREFIX_LENGTH } from "../constants";

export const getEnumValue = (enumElement) => enumElement?.substring(ENUM_PREFIX_LENGTH);
