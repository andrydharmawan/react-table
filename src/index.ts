import BgsTable from "./components/Table";

export default BgsTable;

export { type BgsTableDefaultProps } from "./components/Table";
export * from "./hooks/use-api-call";
export * from "./hooks/use-delay";
export * from "./hooks/use-formatted";
export * from "./hooks/use-interval";
export * from "./hooks/use-key-press";
export * from "./hooks/create-api-helper";
export * from "./hooks/use-api-action";
export * from "./hooks/use-scroll.hook";
export * from "./hooks/use-pagination.hook";
export * from "./types";
export * from "./components/Element";
export { useBgsCore, BgsCoreProvider, type BgsCoreProps } from "./contexts/BgsCore.context";
export { useBgsTable, type BgsTableRef } from "./contexts/Table.context";
export { useBgsTableRow } from "./contexts/TRow.context";
export { useBgsTableColumn } from "./contexts/TCell.context";
export { useBgsTableColumnHead } from "./contexts/THead.context";
export * from "./components/Highlight";

