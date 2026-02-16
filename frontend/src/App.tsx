import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StudentsList from './pages/StudentsList';
import Diary from './pages/Diary';
import Grades from './pages/Grades';
import LessonPlan from './pages/LessonPlan';
import Schools from './pages/secretariat/Schools';
import AcademicYears from './pages/secretariat/AcademicYears';
import Subjects from './pages/secretariat/Subjects';
import Zoning from './pages/secretariat/Zoning';
import Queue from './pages/secretariat/Queue';
import Educacenso from './pages/secretariat/Educacenso';
import Council from './pages/secretariat/Council';
import PedagogicalDashboard from './pages/pedagogical/Dashboard';
import PortalLogin from './pages/portal/Login';
import StudentHome from './pages/portal/StudentHome';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <MantineProvider defaultColorScheme="light">
                <Layout>
                    <Switch>
                        <Route path="/" component={Dashboard} />
                        <Route path="/alunos" component={StudentsList} />
                        <Route path="/diario" component={Diary} />
                        <Route path="/notas" component={Grades} />
                        <Route path="/planejamento" component={LessonPlan} />

                        {/* Secretaria */}
                        <Route path="/secretaria/escolas" component={Schools} />
                        <Route path="/secretaria/anos-letivos" component={AcademicYears} />
                        <Route path="/secretaria/disciplinas" component={Subjects} />
                        <Route path="/secretaria/conselho" component={Council} />
                        <Route path="/secretaria/zoneamento" component={Zoning} />
                        <Route path="/secretaria/fila" component={Queue} />
                        <Route path="/secretaria/educacenso" component={Educacenso} />
                        <Route path="/pedagogico/dashboard" component={PedagogicalDashboard} />

                        {/* Portal do Aluno */}
                        <Route path="/portal/login" component={PortalLogin} />
                        <Route path="/portal/home" component={StudentHome} />

                        <Route>404: Página não encontrada</Route>
                    </Switch>
                </Layout>
            </MantineProvider>
        </QueryClientProvider>
    );
}

export default App;
