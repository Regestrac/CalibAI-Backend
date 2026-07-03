const serialize = (error) => {
  if (!error) return { message: "Unknown error" };
  if (typeof error === "string") return { message: error };

  return {
    message: error?.message || "Unknown error",
    name: error?.name,
    stack: error?.stack,
    code: error?.code,
    status: error?.status || error?.response?.status,
    responseData: error?.response?.data,
    config: error?.config
      ? { url: error?.config?.url, method: error?.config?.method }
      : undefined,
    data: error?.data,
  };
};

export const logError = (label, error, context) => {
  const details = context ? { ...serialize(error), context } : serialize(error);

  try {
    console.error(`[${label}]`, details);
  } catch {}

  return details;
};