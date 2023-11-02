import styles from './box-plot.module.scss';
export default function BoxPlot({
  stats,
}: {
  stats: {
    max: number;
    min: number;
    mean: number;
    median: number;
    upper_q: number;
    lower_q: number;
  };
}) {
  const { max: maxVal, min: minVal, mean, median, upper_q, lower_q } = stats;
  return (
    <div className={styles['box-plot']}>
      <div
        className={styles['range']}
        style={{
          width: `${maxVal - minVal}%`,
          left: `${minVal}%`,
        }}
      />
      <div
        className={styles['iqr']}
        style={{
          width: `${Math.round(upper_q - lower_q)}%`,
          left: `${Math.round(lower_q)}%`,
        }}
      />
      <div
        className={styles['median-grade']}
        style={{ left: `${Math.round(median)}%` }}
      />
      <div
        className={styles['avg-grade']}
        style={{ left: `${Math.round(mean)}%` }}
      />
      <div
        className={styles['min-grade']}
        style={{ left: `${Math.round(minVal)}%` }}
      />
      <div
        className={styles['max-grade']}
        style={{ left: `${Math.round(maxVal)}%` }}
      />
    </div>
  );
}
