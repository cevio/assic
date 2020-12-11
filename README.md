# `assic`

Parallel to serial module which like async to sync

## Install

```bash
npm i assic
```

## Usage

```ts
import { Assic } from 'assic';
const ass = new Assic();

function b1() {
  return new Promise(resolve => {
    setTImeout(() => {
      console.log('a1');
      resolve();
    }, 3000);
  })
}

function b2() {
  console.log('a2')
}

function a1() {
  ass.use(b1);
}

function a2() {
  ass.use(b2);
}

// run:

b1();
b2();

// output:
// a2
// a1

// run

a1();
a2();

// output:
// a1
// a2
```