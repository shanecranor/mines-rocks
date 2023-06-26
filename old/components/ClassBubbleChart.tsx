import {
  Chart as ChartJS,
  Legend,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Colors, TimeScale } from "chart.js";
import { Bubble } from "react-chartjs-2";
import { homedir } from "os";
import "chartjs-adapter-date-fns";
import { enUS } from "date-fns/locale";

ChartJS.register(LinearScale, TimeScale, PointElement, Tooltip, Legend, Colors);
function groupBy(arr, key) {
    return arr.reduce((acc, cur) => {
      acc[cur[key]] = [...acc[cur[key]] || [], cur];
      return acc;
    }, []).filter(Boolean);
}

export default function ClassBubbleChart() {
  const total = assignments[course_id].reduce(
    (p, item) => (p + Number(item.points_possible)), 0,
  );
  const rdata = assignments[course_id].map((item) => ({
    category: item.assignment_group_id,
    v: item.name,
    x: item.due_at,
    y: item?.score_statistics?.mean / item.points_possible * 100,
    r: (item.points_possible / total * 300) + 2,
  }));
  const data = {
    datasets: 
	groupBy(rdata, "category").map((item) => ({
		label: String(item[0].category),
		data: item,
		backgroundColor: `rgba(${(item[0].category * 40) % 255}, 30, ${
		  (item[0].category * 50) % 255
		}, 0.6)`,
	  }));
  };
  const options = {
    plugins: { tooltip: { callbacks: {
          label: function (t, d) {
            return t.raw.v;
          },
    }}},
    scales: {
      y: { beginAtZero: true },
      x: {
        type: "time",
        adapters: { date: { locale: enUS } },
        time: { unit: "month" },
      },
    },
  };
  return <Bubble options={options} data={data} />;
}
