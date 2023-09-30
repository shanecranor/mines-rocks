"use client"
import { observable } from "@legendapp/state";
export const searchOptions$ = observable({
  searchText: "",
  semester: {
    spring: true,
    fall: true,
    summer: true,
  },
});