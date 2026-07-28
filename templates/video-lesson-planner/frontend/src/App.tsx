import { Route, Switch } from "wouter";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CreatePlan from "./pages/CreatePlan";
import PlanDetail from "./pages/PlanDetail";
import UploadVideo from "./pages/UploadVideo";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/create" component={CreatePlan} />
        <Route path="/plan/:id" component={PlanDetail} />
        <Route path="/upload/:lessonId" component={UploadVideo} />
        <Route path="/analytics" component={Analytics} />
        <Route>
          <div className="text-center py-20 text-muted-foreground">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p>Page not found</p>
          </div>
        </Route>
      </Switch>
    </Layout>
  );
}
