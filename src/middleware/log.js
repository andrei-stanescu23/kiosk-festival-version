/* eslint-disable */

export default function log({ to, next }) {
    console.log(to.name);
    return next();
}