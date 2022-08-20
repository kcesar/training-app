import React from "react";

export interface PageParentStore {

}

export abstract class PageStore {
  parent: PageParentStore;

  constructor(parentStore: PageParentStore) {
    this.parent = parentStore;
  }

  abstract get ui(): React.ReactNode;
}