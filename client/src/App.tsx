import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm, SubmitHandler } from "react-hook-form";
import Pagination from "./components/Pagination";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface FormData {
  username: string;
  token: string;
  makePrivate: string;
}
const apiUrl = import.meta.env.VITE_API_URL;

const App: React.FC = () => {
  const [repos, setRepos] = useState<string[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      username: "",
      token: "",
      makePrivate: "true",
    },
  });

  const fetchRepos = async (page: number) => {
    const { username, token } = watch();

    if (!username || !token) return;

    setLoading(true);

    try {
      const response = await axios.get(
        `https://api.github.com/user/repos?per_page=20&page=${page}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      setRepos(response.data.map((repo: { name: string }) => repo.name));
      const linkHeader = response.headers["link"];
      if (linkHeader) {
        const pages = linkHeader.match(/page=(\d+)>; rel="last"/);
        setTotalPages(pages ? parseInt(pages[1], 10) : 1);
      }
    } catch (error) {
      toast.error(
        "Failed to fetch repositories. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const makePrivate = data.makePrivate === "true";

    try {
      await axios.post(`${apiUrl}/update-repos`, {
        username: data.username,
        token: data.token,
        repos: selectedRepos,
        makePrivate,
      });
      toast.success("Repositories updated successfully");
    } catch (error) {
      console.error("Failed to update repositories", error);
      toast.error("Failed to update repositories. Please try again.");
    }
  };

  useEffect(() => {
    fetchRepos(currentPage);
  }, [currentPage]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        GitHub Repo Manager
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-[#1b263b] p-6 rounded-lg shadow-lg mb-6 border border-gray-200"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#e0e1dd]">
            GitHub Username
          </label>
          <input
            type="text"
            placeholder="Enter your GitHub username"
            {...register("username", { required: "Username is required" })}
            className={`border p-3 rounded w-full mt-1 bg-[#415a77] placeholder-[#9ca3af] text-[#f3f3f3] ${
              errors.username ? "border-red-500" : ""
            }`}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[#e0e1dd]">
            GitHub Token
          </label>
          <input
            type="password"
            placeholder="Enter your GitHub token"
            {...register("token", { required: "Token is required" })}
            className={`border p-3 rounded w-full mt-1 bg-[#415a77] placeholder-[#9ca3af] text-[#f3f3f3] ${
              errors.token ? "border-red-500" : ""
            }`}
          />
          {errors.token && (
            <p className="text-red-500 text-sm mt-1">{errors.token.message}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => fetchRepos(currentPage)}
          className="bg-transparent text-white border border-gray-200 px-4 py-2 rounded w-full mb-4 hover:bg-[#e0e1dd] hover:text-[#0d1b2a] transition"
        >
          Fetch Repositories
        </button>

        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#e0e1dd]"></div>
          </div>
        ) : (
          <div>
            {repos.length > 0 ? (
              <div className="space-y-2">
                {repos.map((repo) => (
                  <div
                    key={repo}
                    className="flex items-center space-x-2 p-2 bg-[#415a77] rounded-md"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRepos.includes(repo)}
                      onChange={() => {
                        setSelectedRepos((prev) =>
                          prev.includes(repo)
                            ? prev.filter((r) => r !== repo)
                            : [...prev, repo]
                        );
                      }}
                      className="mr-2"
                    />
                    <span>{repo}</span>
                  </div>
                ))}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    fetchRepos(page);
                  }}
                />
              </div>
            ) : (
              <div className="text-center">No repositories found</div>
            )}
          </div>
        )}

        <div className="mt-6">
          <fieldset className="flex gap-4">
            <legend className="block text-sm font-medium text-[#e0e1dd]">
              Visibility
            </legend>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="true"
                {...register("makePrivate", { required: true })}
                className="form-radio text-[#f3f3f3]"
              />
              <span className="ml-2 text-[#e0e1dd]">Make Private</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="false"
                {...register("makePrivate", { required: true })}
                className="form-radio text-[#f3f3f3]"
              />
              <span className="ml-2 text-[#e0e1dd]">Make Public</span>
            </label>
          </fieldset>
        </div>

        <button
          type="submit"
          className="bg-[#386641] text-white px-4 py-2 rounded mt-4 w-full hover:bg-[#6a994e] transition"
        >
          Update Repositories
        </button>
      </form>

      <ToastContainer />
    </div>
  );
};

export default App;
