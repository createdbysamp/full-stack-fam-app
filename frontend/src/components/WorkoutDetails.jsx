import { FaArrowDownLong } from "react-icons/fa6";

export default function WorkoutDetails({ parsedExercise }) {
  return (
    <div className="mb-3">
      {parsedExercise.exercises.map((d, i) => (
        <>
          <div key={d.name}>
            <div className="card h-100 mb-3">
              <div className="card-header d-flex justify-content-center">
                <h3 className="fw-semibold text-center m-0">{d.name}</h3>
              </div>
              <div className="card-body">
                <p>Sets: {d.sets}</p>
                <p>Reps: {d.reps}</p>
                <p>{d.description}</p>
                <p>Instructions: {d.instructions}</p>
              </div>
            </div>
          </div>
          {i != parsedExercise.exercises.length - 1 && (
            <div className="d-flex justify-content-center">
              <FaArrowDownLong
                color={i % 2 == 0 ? "#fc346f" : "#39cbfb"}
                size={50}
                className="mb-3"
              />
            </div>
          )}
        </>
      ))}
    </div>
  );
}
