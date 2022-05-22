export const formatTime = (time) => {
  const t = new Date(time);
  return (
    t.getMonth() +
    "/" +
    t.getDate() +
    " " +
    t.getHours() +
    ":" +
    t.getMinutes() +
    ":" +
    t.getSeconds()
  );
};
