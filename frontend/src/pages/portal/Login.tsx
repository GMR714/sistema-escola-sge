import { useState } from 'react';
import { TextInput, Button, Paper, Title, Container, Text } from '@mantine/core';
import { useLocation } from 'wouter';
import { notifications } from '@mantine/notifications';
import { api } from '../../api/client';

export default function StudentLogin() {
    const [cpf, setCpf] = useState('');
    const [loading, setLoading] = useState(false);
    const [, setLocation] = useLocation();

    const handleLogin = async () => {
        if (!cpf) return;
        setLoading(true);
        try {
            const response = await api.post('/portal/login', { cpf });
            localStorage.setItem('student_token', JSON.stringify(response.data));
            notifications.show({
                title: 'Bem-vindo!',
                message: `Olá, ${response.data.nome}`,
                color: 'green',
            });
            setLocation('/portal/home');
        } catch (error) {
            notifications.show({
                title: 'Erro no login',
                message: 'CPF não encontrado ou inválido.',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size={420} my={40}>
            <Title ta="center" order={2}>Portal do Aluno</Title>
            <Text c="dimmed" size="sm" ta="center" mt={5}>
                Digite seu CPF para acessar suas notas e frequência
            </Text>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <TextInput
                    label="CPF do Aluno"
                    placeholder="000.000.000-00"
                    required
                    value={cpf}
                    onChange={(event) => setCpf(event.currentTarget.value)}
                />
                <Button fullWidth mt="xl" onClick={handleLogin} loading={loading}>
                    Entrar
                </Button>
            </Paper>
        </Container>
    );
}
