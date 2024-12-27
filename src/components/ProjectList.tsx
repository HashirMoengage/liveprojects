import { useState, useEffect, useMemo, FC } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { SimplifiedProject, Project } from "../interfaces/Project";
import "../styles/ProjectList.css";

/**
 * Helper function to determine a specific CSS class based on the project's status.
 * This allows for differentiated styling of project statuses in the UI.
 *
 * @param status - The current status of the project.
 * @returns A string representing a CSS class tied to a specific project status.
 */
const getStatusClass = (status: string): string => {
  switch (status) {
    case "Go-Live Ready":
      return "status-go-live-ready";
    case "Testing":
      return "status-testing";
    default:
      return "";
  }
};

/**
 * Helper function to create an array of <span> elements representing the
 * scope of work items from the provided comma-separated string.
 *
 * @param scopeOfWork - A comma-separated string of work scopes.
 * @returns An array of <span> elements for each scope item.
 */
const makeScopeOfWorkElements = (scopeOfWork: string) => {
  return scopeOfWork.split(",").map((scopeItem, index) => (
    <span key={index} className="scope-item">
      {scopeItem.trim()}
    </span>
  ));
};

/**
 * A functional component that displays a list of projects filtered by a region code.
 * The component handles fetching of project data, tracks counts of projects by status,
 * and displays a loader, error message, or the list of projects based on the current state.
 */
const ProjectList: FC = () => {
  const { regionCode } = useParams<{ regionCode: string }>();
  const [projects, setProjects] = useState<SimplifiedProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State variables to count the number of projects for specific statuses.
  const [goLiveReadyCount, setGoLiveReadyCount] = useState<number>(0);
  const [testingCount, setTestingCount] = useState<number>(0);

  useEffect(() => {
    /**
     * Fetches projects from an API by status and filters them according to region.
     * It transforms the fetched project data into a simplified structure.
     *
     * @param status - The status of projects to fetch.
     * @returns The filtered and simplified project objects array.
     */
    const fetchProjectsByStatus = async (status: string) => {
      try {
        const statusParamValue = status === "Go-Live Ready" ? "18" : "4";
        const response = await axios.get(
          "https://api.rocketlane.com/api/1.0/projects",
          {
            headers: {
              "api-key": import.meta.env.VITE_API_KEY,
            },
            params: {
              "project.field.26538.value": statusParamValue,
              includeFields:
                "fields.26526,fields.565384,fields.51409,fields.26472," +
                "fields.284254,fields.625583,fields.26538,fields.190414," +
                "fields.25821,fields.687147,fields.643919",
            },
          }
        );

        // Define a mapping of field IDs for easy identification.
        const fieldIds = {
          region: 565384,
          implementationManager: 51409,
          projectManager: 625583,
          currentStatus: 26538,
          scopeOfWork: 643919,
        };

        // Filters projects by the region code and transforms them into a simplified format.
        return response.data.data
          .filter((project: Project) => {
            return project.fields.some(
              (field) =>
                field.fieldId === fieldIds.region &&
                field.fieldValueLabel === regionCode
            );
          })
          .map((project: Project): SimplifiedProject => {
            const fieldFinder = (id: number) =>
              project.fields.find((field) => field.fieldId === id)
                ?.fieldValueLabel || "";

            return {
              projectId: project.projectId,
              projectName: project.projectName,
              implementationManager: fieldFinder(
                fieldIds.implementationManager
              ),
              projectManager: fieldFinder(fieldIds.projectManager),
              currentStatus: fieldFinder(fieldIds.currentStatus),
              scopeOfWork: fieldFinder(fieldIds.scopeOfWork),
            };
          });
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Failed to fetch projects. Please try again later.");
        return []; // In case of an error, returns an empty array to prevent app failure.
      }
    };

    // Initializes or resets project counts when the region code changes.
    setGoLiveReadyCount(0);
    setTestingCount(0);

    /**
     * Fetches and sets the project data for both "Go-Live Ready" and "Testing" statuses
     * and aggregates the results into the component's state.
     */
    const fetchAndSetProjects = async () => {
      // Shows loading indicator while fetching.
      setLoading(true);

      // Fetches projects for both statuses concurrently.
      const goLiveProjects = await fetchProjectsByStatus("Go-Live Ready");
      const testingProjects = await fetchProjectsByStatus("Testing");

      // Combines and sets the fetched project data.
      setProjects([...goLiveProjects, ...testingProjects]);

      // Sets the counts for both project statuses.
      setGoLiveReadyCount(goLiveProjects.length);
      setTestingCount(testingProjects.length);

      // Removes the loading indicator once done.
      setLoading(false);
    };

    // Triggers project data fetching if a valid region code is present.
    if (regionCode) {
      fetchAndSetProjects();
    }

    // Re-runs this effect when the regionCode changes to fetch new data.
  }, [regionCode]);

  // Memoizes the table contents to prevent unnecessary renders and improve performance.
  const tableContent = useMemo(
    () =>
      projects.map((project) => (
        <tr key={project.projectId}>
          <td className="project-name">{project.projectName}</td>
          <td>{project.implementationManager}</td>
          <td>{project.projectManager}</td>
          <td className={getStatusClass(project.currentStatus)}>
            {project.currentStatus}
          </td>
          <td>{makeScopeOfWorkElements(project.scopeOfWork)}</td>
        </tr>
      )),
    [projects]
  );

  // Displays loading spinner or error message depending on the state.
  if (loading) {
    return <p className="loader"></p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  // Renders the main content of the component, including the list of projects and status counts.
  return (
    <div className="project-list-container">
      <h2 className="TableHeading">Projects in {regionCode}</h2>
      <div className="count">
        <p className="counter go-live-counter">
          Go-Live Ready Projects: {goLiveReadyCount}
        </p>
        <p className="counter testing-counter">
          Testing Projects: {testingCount}
        </p>
      </div>
      <div className="table-responsive">
        <table className="project-list-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Implementation Manager</th>
              <th>Project Manager</th>
              <th>Current Status</th>
              <th>Scope of Work</th>
            </tr>
          </thead>
          <tbody>{tableContent}</tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectList;
