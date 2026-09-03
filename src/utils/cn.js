/** Tiny class-name joiner — filters out falsy values. */
export const cn = (...classes) => classes.filter(Boolean).join(' ')
